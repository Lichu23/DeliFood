import prisma from '../../lib/prisma';
import { NotFoundError, BadRequestError } from '../../utils/errors';

export const deliveryZonesService = {
  /**
   * Lista todas las zonas de entrega de una tienda
   */
  async list(storeId: string, includeInactive: boolean = false) {
    const where: any = { storeId };

    if (!includeInactive) {
      where.isActive = true;
    }

    const zones = await prisma.deliveryZone.findMany({
      where,
      orderBy: { maxDistance: 'asc' },
    });

    return zones;
  },

  /**
   * Obtiene una zona por ID
   */
  async getById(storeId: string, zoneId: string) {
    const zone = await prisma.deliveryZone.findFirst({
      where: {
        id: zoneId,
        storeId,
      },
    });

    if (!zone) {
      throw new NotFoundError('Delivery zone not found');
    }

    return zone;
  },

  /**
   * Crea una nueva zona de entrega
   */
  async create(
    storeId: string,
    data: {
      name: string;
      maxDistance: number;
      deliveryFee: number;
      minOrder: number;
    }
  ) {
    const zone = await prisma.deliveryZone.create({
      data: {
        storeId,
        name: data.name,
        maxDistance: data.maxDistance,
        deliveryFee: data.deliveryFee,
        minOrder: data.minOrder,
      },
    });

    return zone;
  },

  /**
   * Actualiza una zona de entrega
   */
  async update(
    storeId: string,
    zoneId: string,
    data: {
      name?: string;
      maxDistance?: number;
      deliveryFee?: number;
      minOrder?: number;
      isActive?: boolean;
    }
  ) {
    const existing = await prisma.deliveryZone.findFirst({
      where: {
        id: zoneId,
        storeId,
      },
    });

    if (!existing) {
      throw new NotFoundError('Delivery zone not found');
    }

    const zone = await prisma.deliveryZone.update({
      where: { id: zoneId },
      data,
    });

    return zone;
  },

  /**
   * Elimina una zona de entrega
   */
  async delete(storeId: string, zoneId: string) {
    const existing = await prisma.deliveryZone.findFirst({
      where: {
        id: zoneId,
        storeId,
      },
    });

    if (!existing) {
      throw new NotFoundError('Delivery zone not found');
    }

    // Verificar que quede al menos una zona activa
    const activeZones = await prisma.deliveryZone.count({
      where: {
        storeId,
        isActive: true,
        id: { not: zoneId },
      },
    });

    if (activeZones === 0) {
      throw new BadRequestError('Cannot delete the last active delivery zone');
    }

    await prisma.deliveryZone.delete({
      where: { id: zoneId },
    });

    return { success: true };
  },

  /**
   * Busca la zona aplicable según la distancia
   */
  async findZoneByDistance(storeId: string, distance: number) {
    const zone = await prisma.deliveryZone.findFirst({
      where: {
        storeId,
        isActive: true,
        maxDistance: { gte: distance },
      },
      orderBy: { maxDistance: 'asc' },
    });

    return zone;
  },
};