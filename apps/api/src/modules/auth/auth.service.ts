import { Role, Currency } from '@prisma/client';
import prisma from '../../lib/prisma';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateToken } from '../../utils/jwt';
import { createUniqueSlug } from '../../utils/slug';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../../utils/errors';
import { RegisterInput, LoginInput } from './auth.schema';

export const authService = {
  /**
   * Registra un nuevo usuario con su tienda (onboarding completo)
   */
  async register(data: RegisterInput) {
    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Crear slug único para la tienda
    const slug = await createUniqueSlug(data.storeName);

    // Hash de la contraseña
    const passwordHash = await hashPassword(data.password);

    // Crear todo en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear usuario
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          name: data.name,
          phone: data.phone,
        },
      });

      // 2. Crear tienda
      const store = await tx.store.create({
        data: {
          name: data.storeName,
          slug,
          phone: data.storePhone,
          logo: data.storeLogo,
          address: data.storeAddress,
          latitude: data.storeLatitude,
          longitude: data.storeLongitude,
          currency: data.currency as Currency,
          ownerId: user.id,
        },
      });

      // 3. Crear settings
      await tx.storeSettings.create({
        data: {
          storeId: store.id,
          acceptsCash: data.acceptsCash,
          acceptsTransfer: data.acceptsTransfer,
          bankName: data.bankName,
          bankAccountHolder: data.bankAccountHolder,
          bankAccountNumber: data.bankAccountNumber,
          bankAlias: data.bankAlias,
          minAdvanceHours: data.minAdvanceHours,
          maxAdvanceDays: data.maxAdvanceDays,
          immediateCancelMinutes: data.immediateCancelMinutes,
          scheduledCancelHours: data.scheduledCancelHours,
        },
      });

      // 4. Crear membresía como OWNER
      await tx.storeMember.create({
        data: {
          storeId: store.id,
          userId: user.id,
          role: Role.OWNER,
        },
      });

      // 5. Crear franjas horarias
      await tx.deliverySlot.createMany({
        data: data.deliverySlots.map((slot) => ({
          storeId: store.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          maxOrdersPerHour: slot.maxOrdersPerHour,
        })),
      });

      // 6. Crear zonas de entrega
      await tx.deliveryZone.createMany({
        data: data.deliveryZones.map((zone) => ({
          storeId: store.id,
          name: zone.name,
          maxDistance: zone.maxDistance,
          deliveryFee: zone.deliveryFee,
          minOrder: zone.minOrder,
        })),
      });

      return { user, store };
    });

    // Generar token
    const token = generateToken({
      userId: result.user.id,
      email: result.user.email,
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        phone: result.user.phone,
      },
      store: {
        id: result.store.id,
        name: result.store.name,
        slug: result.store.slug,
        currency: result.store.currency,
      },
      token,
    };
  },

  /**
   * Inicia sesión de un usuario
   */
  async login(data: LoginInput) {
    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        memberships: {
          where: { isActive: true },
          include: {
            store: {
              select: {
                id: true,
                name: true,
                slug: true,
                currency: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verificar contraseña
    const validPassword = await comparePassword(data.password, user.passwordHash);

    if (!validPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generar token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
      stores: user.memberships.map((m) => ({
        id: m.store.id,
        name: m.store.name,
        slug: m.store.slug,
        currency: m.store.currency,
        role: m.role,
        isActive: m.store.isActive,
      })),
      token,
    };
  },

  /**
   * Obtiene el perfil del usuario actual
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          where: { isActive: true },
          include: {
            store: {
              select: {
                id: true,
                name: true,
                slug: true,
                currency: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      stores: user.memberships.map((m) => ({
        id: m.store.id,
        name: m.store.name,
        slug: m.store.slug,
        currency: m.store.currency,
        role: m.role,
        isActive: m.store.isActive,
      })),
    };
  },

  /**
   * Actualiza el perfil del usuario
   */
  async updateProfile(userId: string, data: { name?: string; phone?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phone: data.phone,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
    };
  },

  /**
   * Cambia la contraseña del usuario
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verificar contraseña actual
    const validPassword = await comparePassword(currentPassword, user.passwordHash);

    if (!validPassword) {
      throw new BadRequestError('Current password is incorrect');
    }

    // Hash de la nueva contraseña
    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { success: true };
  },
};