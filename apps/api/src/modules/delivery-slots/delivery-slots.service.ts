import prisma from '../../lib/prisma';
import { NotFoundError, BadRequestError } from '../../utils/errors';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const deliverySlotsService = {
  /**
   * Lista todas las franjas horarias de una tienda
   */
  async list(storeId: string, includeInactive: boolean = false) {
    const where: any = { storeId };

    if (!includeInactive) {
      where.isActive = true;
    }

    const slots = await prisma.deliverySlot.findMany({
      where,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return slots.map((slot) => ({
      ...slot,
      dayName: DAY_NAMES[slot.dayOfWeek],
    }));
  },

  /**
   * Lista franjas por día de la semana
   */
  async listByDay(storeId: string, dayOfWeek: number) {
    const slots = await prisma.deliverySlot.findMany({
      where: {
        storeId,
        dayOfWeek,
        isActive: true,
      },
      orderBy: { startTime: 'asc' },
    });

    return slots.map((slot) => ({
      ...slot,
      dayName: DAY_NAMES[slot.dayOfWeek],
    }));
  },

  /**
   * Obtiene una franja por ID
   */
  async getById(storeId: string, slotId: string) {
    const slot = await prisma.deliverySlot.findFirst({
      where: {
        id: slotId,
        storeId,
      },
    });

    if (!slot) {
      throw new NotFoundError('Delivery slot not found');
    }

    return {
      ...slot,
      dayName: DAY_NAMES[slot.dayOfWeek],
    };
  },

  /**
   * Crea una nueva franja horaria
   */
  async create(
    storeId: string,
    data: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      maxOrdersPerHour: number;
    }
  ) {
    // Validar que startTime < endTime
    if (data.startTime >= data.endTime) {
      throw new BadRequestError('Start time must be before end time');
    }

    // Verificar solapamiento con otras franjas del mismo día
    const existingSlots = await prisma.deliverySlot.findMany({
      where: {
        storeId,
        dayOfWeek: data.dayOfWeek,
        isActive: true,
      },
    });

    for (const slot of existingSlots) {
      if (
        (data.startTime >= slot.startTime && data.startTime < slot.endTime) ||
        (data.endTime > slot.startTime && data.endTime <= slot.endTime) ||
        (data.startTime <= slot.startTime && data.endTime >= slot.endTime)
      ) {
        throw new BadRequestError(
          `Time slot overlaps with existing slot: ${slot.startTime} - ${slot.endTime}`
        );
      }
    }

    const newSlot = await prisma.deliverySlot.create({
      data: {
        storeId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        maxOrdersPerHour: data.maxOrdersPerHour,
      },
    });

    return {
      ...newSlot,
      dayName: DAY_NAMES[newSlot.dayOfWeek],
    };
  },

  /**
   * Actualiza una franja horaria
   */
  async update(
    storeId: string,
    slotId: string,
    data: {
      dayOfWeek?: number;
      startTime?: string;
      endTime?: string;
      maxOrdersPerHour?: number;
      isActive?: boolean;
    }
  ) {
    const existing = await prisma.deliverySlot.findFirst({
      where: {
        id: slotId,
        storeId,
      },
    });

    if (!existing) {
      throw new NotFoundError('Delivery slot not found');
    }

    // Validar tiempos si se actualizan
    const startTime = data.startTime || existing.startTime;
    const endTime = data.endTime || existing.endTime;

    if (startTime >= endTime) {
      throw new BadRequestError('Start time must be before end time');
    }

    // Verificar solapamiento si cambian los tiempos o el día
    if (data.startTime || data.endTime || data.dayOfWeek !== undefined) {
      const dayOfWeek = data.dayOfWeek ?? existing.dayOfWeek;

      const existingSlots = await prisma.deliverySlot.findMany({
        where: {
          storeId,
          dayOfWeek,
          isActive: true,
          id: { not: slotId },
        },
      });

      for (const slot of existingSlots) {
        if (
          (startTime >= slot.startTime && startTime < slot.endTime) ||
          (endTime > slot.startTime && endTime <= slot.endTime) ||
          (startTime <= slot.startTime && endTime >= slot.endTime)
        ) {
          throw new BadRequestError(
            `Time slot overlaps with existing slot: ${slot.startTime} - ${slot.endTime}`
          );
        }
      }
    }

    const updatedSlot = await prisma.deliverySlot.update({
      where: { id: slotId },
      data,
    });

    return {
      ...updatedSlot,
      dayName: DAY_NAMES[updatedSlot.dayOfWeek],
    };
  },

  /**
   * Elimina una franja horaria
   */
  async delete(storeId: string, slotId: string) {
    const existing = await prisma.deliverySlot.findFirst({
      where: {
        id: slotId,
        storeId,
      },
    });

    if (!existing) {
      throw new NotFoundError('Delivery slot not found');
    }

    // Verificar que quede al menos una franja activa
    const activeSlots = await prisma.deliverySlot.count({
      where: {
        storeId,
        isActive: true,
        id: { not: slotId },
      },
    });

    if (activeSlots === 0) {
      throw new BadRequestError('Cannot delete the last active delivery slot');
    }

    await prisma.deliverySlot.delete({
      where: { id: slotId },
    });

    return { success: true };
  },
};