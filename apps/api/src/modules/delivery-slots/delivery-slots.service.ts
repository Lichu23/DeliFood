import prisma from '../../lib/prisma';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { OrderStatus, OrderType } from '@prisma/client';

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

  /**
   * Obtiene franjas horarias disponibles para una fecha (público)
   */
  async getAvailableSlots(storeSlug: string, dateString: string) {
    // Obtener tienda por slug
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug },
    });

    if (!store || !store.isActive) {
      throw new NotFoundError('Store not found');
    }

    // Parsear fecha y obtener día de la semana
    const date = new Date(dateString);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

    // Verificar si la fecha está bloqueada
    const blockedDate = await prisma.blockedDate.findFirst({
      where: {
        storeId: store.id,
        date: date,
      },
    });

    // Si la fecha está bloqueada, retornar array vacío
    if (blockedDate) {
      return [];
    }

    // Obtener todas las franjas activas para ese día de la semana
    const slots = await prisma.deliverySlot.findMany({
      where: {
        storeId: store.id,
        dayOfWeek: dayOfWeek,
        isActive: true,
      },
      orderBy: { startTime: 'asc' },
    });

    // Para cada franja, calcular disponibilidad
    const availableSlots = await Promise.all(
      slots.map(async (slot) => {
        // Contar pedidos programados para esta fecha y franja
        const orderCount = await prisma.order.count({
          where: {
            storeId: store.id,
            type: OrderType.SCHEDULED,
            scheduledDate: date,
            scheduledSlotStart: slot.startTime,
            status: { notIn: [OrderStatus.CANCELLED] },
          },
        });

        // Calcular horas en el slot
        const [startHours, startMinutes] = slot.startTime.split(':').map(Number);
        const [endHours, endMinutes] = slot.endTime.split(':').map(Number);
        const slotHours = (endHours * 60 + endMinutes - startHours * 60 - startMinutes) / 60;

        // Capacidad máxima del slot
        const maxOrders = slot.maxOrdersPerHour * slotHours;
        const remainingCapacity = maxOrders - orderCount;

        return {
          slot: {
            id: slot.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            maxOrdersPerHour: slot.maxOrdersPerHour,
          },
          available: remainingCapacity > 0,
          remainingCapacity: Math.max(0, remainingCapacity),
        };
      })
    );

    return availableSlots;
  },
};