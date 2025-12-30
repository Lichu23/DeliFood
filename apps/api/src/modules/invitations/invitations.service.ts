import { Role } from "@prisma/client";
import { randomBytes } from "crypto";
import prisma from "../../lib/prisma";
import { hashPassword } from "../../utils/password";
import { generateToken } from "../../utils/jwt";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../utils/errors";

export const invitationsService = {
  /**
   * Crea una nueva invitación
   */
  async create(
    storeId: string,
    invitedById: string,
    email: string,
    role: Role
  ) {
    // Verificar que la tienda existe
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundError("Store not found");
    }

    // Verificar si ya existe una membresía activa
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const existingMembership = await prisma.storeMember.findUnique({
        where: {
          storeId_userId: {
            storeId,
            userId: existingUser.id,
          },
        },
      });

      if (existingMembership && existingMembership.isActive) {
        throw new ConflictError("User is already a member of this store");
      }
    }

    // Verificar si ya hay una invitación pendiente
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        storeId,
        email,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvitation) {
      throw new ConflictError(
        "There is already a pending invitation for this email"
      );
    }

    // Generar token único
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expira en 7 días

    // Crear invitación
    const invitation = await prisma.invitation.create({
      data: {
        storeId,
        email,
        role,
        token,
        expiresAt,
        invitedById,
      },
      include: {
        store: {
          select: {
            name: true,
          },
        },
        invitedBy: {
          select: {
            name: true,
          },
        },
      },
    });

    // TODO: Enviar email con la invitación

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      storeName: invitation.store.name,
      invitedBy: invitation.invitedBy.name,
      expiresAt: invitation.expiresAt,
      // Solo para desarrollo, en producción no enviar el token
      invitationLink: `${
        process.env.APP_URL || "http://localhost:3000"
      }/invite/${token}`,
    };
  },

  /**
   * Lista las invitaciones de una tienda
   */
  async listByStore(storeId: string) {
    const invitations = await prisma.invitation.findMany({
      where: { storeId },
      include: {
        invitedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return invitations.map((inv) => ({
      id: inv.id,
      email: inv.email,
      role: inv.role,
      invitedBy: inv.invitedBy.name,
      createdAt: inv.createdAt,
      expiresAt: inv.expiresAt,
      isUsed: !!inv.usedAt,
      isExpired: inv.expiresAt < new Date(),
    }));
  },

  /**
   * Obtiene información de una invitación por token
   */
  async getByToken(token: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        invitedBy: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundError("Invitation not found");
    }

    if (invitation.usedAt) {
      throw new BadRequestError("This invitation has already been used");
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestError("This invitation has expired");
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      store: invitation.store,
      invitedBy: invitation.invitedBy.name,
      expiresAt: invitation.expiresAt,
      userExists: !!existingUser,
    };
  },

  /**
   * Acepta una invitación (usuario nuevo)
   */
  async acceptNew(
    token: string,
    data: { name: string; password: string; phone?: string }
  ) {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        store: true,
      },
    });

    if (!invitation) {
      throw new NotFoundError("Invitation not found");
    }

    if (invitation.usedAt) {
      throw new BadRequestError("This invitation has already been used");
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestError("This invitation has expired");
    }

    // Verificar que el usuario no existe
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      throw new ConflictError(
        "User already exists. Please login and accept the invitation."
      );
    }

    // Hash de la contraseña
    const passwordHash = await hashPassword(data.password);

    // Crear usuario y membresía en transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear usuario
      const user = await tx.user.create({
        data: {
          email: invitation.email,
          passwordHash,
          name: data.name,
          phone: data.phone || "",
        },
      });

      // Crear membresía
      await tx.storeMember.create({
        data: {
          storeId: invitation.storeId,
          userId: user.id,
          role: invitation.role,
        },
      });

      // Marcar invitación como usada
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { usedAt: new Date() },
      });

      return user;
    });

    // Generar token
    const authToken = generateToken({
      userId: result.id,
      email: result.email,
    });

    return {
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
      },
      store: {
        id: invitation.store.id,
        name: invitation.store.name,
        slug: invitation.store.slug,
      },
      role: invitation.role,
      token: authToken,
    };
  },

  /**
   * Acepta una invitación (usuario existente)
   */
  async acceptExisting(token: string, userId: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        store: true,
      },
    });

    if (!invitation) {
      throw new NotFoundError("Invitation not found");
    }

    if (invitation.usedAt) {
      throw new BadRequestError("This invitation has already been used");
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestError("This invitation has expired");
    }

    // Verificar que el usuario existe y el email coincide
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.email !== invitation.email) {
      throw new BadRequestError(
        "This invitation is for a different email address"
      );
    }

    // Verificar que no sea ya miembro
    const existingMembership = await prisma.storeMember.findUnique({
      where: {
        storeId_userId: {
          storeId: invitation.storeId,
          userId,
        },
      },
    });

    if (existingMembership && existingMembership.isActive) {
      throw new ConflictError("You are already a member of this store");
    }

    // Crear o reactivar membresía
    await prisma.$transaction(async (tx) => {
      if (existingMembership) {
        // Reactivar membresía existente
        await tx.storeMember.update({
          where: { id: existingMembership.id },
          data: {
            isActive: true,
            role: invitation.role,
          },
        });
      } else {
        // Crear nueva membresía
        await tx.storeMember.create({
          data: {
            storeId: invitation.storeId,
            userId,
            role: invitation.role,
          },
        });
      }

      // Marcar invitación como usada
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { usedAt: new Date() },
      });
    });

    return {
      store: {
        id: invitation.store.id,
        name: invitation.store.name,
        slug: invitation.store.slug,
      },
      role: invitation.role,
    };
  },

  /**
   * Cancela una invitación
   */
  async cancel(invitationId: string, storeId: string) {
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        storeId,
      },
    });

    if (!invitation) {
      throw new NotFoundError("Invitation not found");
    }

    if (invitation.usedAt) {
      throw new BadRequestError("Cannot cancel a used invitation");
    }

    await prisma.invitation.delete({
      where: { id: invitationId },
    });

    return { success: true };
  },

  /**
   * Reenvía una invitación
   */
  async resend(invitationId: string, storeId: string) {
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        storeId,
      },
    });

    if (!invitation) {
      throw new NotFoundError("Invitation not found");
    }

    if (invitation.usedAt) {
      throw new BadRequestError("Cannot resend a used invitation");
    }

    // Generar nuevo token y extender expiración
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const updated = await prisma.invitation.update({
      where: { id: invitationId },
      data: { token, expiresAt },
    });

    // TODO: Enviar email con la invitación

    return {
      id: updated.id,
      email: updated.email,
      expiresAt: updated.expiresAt,
      invitationLink: `${process.env.APP_URL}/invite/${token}`,
    };
  },
};
