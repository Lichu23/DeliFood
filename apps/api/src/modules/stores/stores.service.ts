import { Role } from "@prisma/client";
import prisma from "../../lib/prisma";
import { createUniqueSlug } from "../../utils/slug";
import { NotFoundError, ForbiddenError } from "../../utils/errors";

export const storesService = {
  /**
   * Obtiene una tienda por ID
   */
  async getById(storeId: string) {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        settings: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!store) {
      throw new NotFoundError("Store not found");
    }

    return store;
  },

  /**
   * Obtiene una tienda por slug (público)
   */
  async getBySlug(slug: string) {
    const store = await prisma.store.findUnique({
      where: { slug },
      include: {
        settings: {
          select: {
            acceptsCash: true,
            acceptsTransfer: true,
            bankName: true,
            bankAccountHolder: true,
            bankAccountNumber: true,
            bankAlias: true,
            minAdvanceHours: true,
            maxAdvanceDays: true,
          },
        },
      },
    });

    if (!store || !store.isActive) {
      throw new NotFoundError("Store not found");
    }

    return {
      id: store.id,
      name: store.name,
      slug: store.slug,
      description: store.description,
      logo: store.logo,
      phone: store.phone,
      address: store.address,
      latitude: store.latitude,
      longitude: store.longitude,
      currency: store.currency,
      settings: store.settings,
    };
  },

  /**
   * Actualiza una tienda
   */
  async update(
    storeId: string,
    data: {
      name?: string;
      description?: string;
      phone?: string;
      email?: string;
      address?: string;
      latitude?: number;
      longitude?: number;
      isActive?: boolean;
    }
  ) {
    // Si se actualiza el nombre, actualizar también el slug
    let slug: string | undefined;
    if (data.name) {
      slug = await createUniqueSlug(data.name, storeId);
    }

    const store = await prisma.store.update({
      where: { id: storeId },
      data: {
        ...data,
        ...(slug && { slug }),
      },
      include: {
        settings: true,
      },
    });

    return store;
  },

  /**
   * Actualiza la configuración de una tienda
   */
  async updateSettings(
    storeId: string,
    data: {
      acceptsCash?: boolean;
      acceptsTransfer?: boolean;
      bankName?: string;
      bankAccountHolder?: string;
      bankAccountNumber?: string;
      bankAlias?: string;
      minAdvanceHours?: number;
      maxAdvanceDays?: number;
      immediateCancelMinutes?: number;
      scheduledCancelHours?: number;
    }
  ) {
    const settings = await prisma.storeSettings.update({
      where: { storeId },
      data,
    });

    return settings;
  },

  /**
   * Obtiene los miembros de una tienda
   */
  async getMembers(storeId: string) {
    const members = await prisma.storeMember.findMany({
      where: { storeId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    });

    return members.map((m) => ({
      id: m.id,
      role: m.role,
      isActive: m.isActive,
      joinedAt: m.joinedAt,
      user: m.user,
    }));
  },

  /**
   * Actualiza el rol de un miembro
   */
  async updateMemberRole(
    storeId: string,
    memberId: string,
    role: Role,
    requestingUserId: string
  ) {
    const member = await prisma.storeMember.findFirst({
      where: {
        id: memberId,
        storeId,
      },
    });

    if (!member) {
      throw new NotFoundError("Member not found");
    }

    // No se puede cambiar el rol del owner
    if (member.role === Role.OWNER) {
      throw new ForbiddenError("Cannot change the role of the owner");
    }

    // No se puede asignar el rol de owner
    if (role === Role.OWNER) {
      throw new ForbiddenError("Cannot assign owner role");
    }

    const updated = await prisma.storeMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return {
      id: updated.id,
      role: updated.role,
      user: updated.user,
    };
  },

  /**
   * Desactiva un miembro de la tienda
   */
  async removeMember(
    storeId: string,
    memberId: string,
    requestingUserId: string
  ) {
    const member = await prisma.storeMember.findFirst({
      where: {
        id: memberId,
        storeId,
      },
    });

    if (!member) {
      throw new NotFoundError("Member not found");
    }

    // No se puede eliminar al owner
    if (member.role === Role.OWNER) {
      throw new ForbiddenError("Cannot remove the owner");
    }

    // No se puede eliminar a uno mismo
    if (member.userId === requestingUserId) {
      throw new ForbiddenError("Cannot remove yourself");
    }

    await prisma.storeMember.update({
      where: { id: memberId },
      data: { isActive: false },
    });

    return { success: true };
  },

  /**
   * Obtiene los repartidores disponibles de una tienda
   */
  async getDeliveryMembers(storeId: string, onlyActive: boolean = true) {
    const where: any = {
      storeId,
      role: Role.DELIVERY,
    };

    if (onlyActive) {
      where.isActive = true;
    }

    const members = await prisma.storeMember.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    return members.map((m) => ({
      id: m.id,
      userId: m.user.id,
      name: m.user.name,
      phone: m.user.phone,
      isActive: m.isActive,
    }));
  },
};
