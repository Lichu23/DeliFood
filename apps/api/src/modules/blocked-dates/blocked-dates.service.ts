import prisma from '../../lib/prisma';
import { NotFoundError, BadRequestError, ConflictError } from '../../utils/errors';

export const blockedDatesService = {
  /**
   * Lista todas las fechas bloqueadas de una tienda
   */
  async list(storeId: string, options?: { from?: Date; to?: Date }) {
    const where: any = { storeId };

    if (options?.from || options?.to) {
      where.date = {};
      if (options.from) {
        where.date.gte = options.from;
      }
      if (options.to) {
        where.date.lte = options.to;
      }
    }

    const blockedDates = await prisma.blockedDate.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    return blockedDates;
  },

  /**
   * Verifica si una fecha está bloqueada
   */
  async isDateBlocked(storeId: string, date: Date): Promise<boolean> {
    const blocked = await prisma.blockedDate.findFirst({
      where: {
        storeId,
        date,
      },
    });

    return !!blocked;
  },

  /**
   * Crea una nueva fecha bloqueada
   */
  async create(
    storeId: string,
    data: {
      date: string;
      reason?: string;
    }
  ) {
    const dateObj = new Date(data.date);

    // Validar que la fecha no sea en el pasado
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateObj < today) {
      throw new BadRequestError('Cannot block a date in the past');
    }

    // Verificar si ya está bloqueada
    const existing = await prisma.blockedDate.findFirst({
      where: {
        storeId,
        date: dateObj,
      },
    });

    if (existing) {
      throw new ConflictError('This date is already blocked');
    }

    const blockedDate = await prisma.blockedDate.create({
      data: {
        storeId,
        date: dateObj,
        reason: data.reason,
      },
    });

    return blockedDate;
  },

  /**
   * Elimina una fecha bloqueada
   */
  async delete(storeId: string, blockedDateId: string) {
    const existing = await prisma.blockedDate.findFirst({
      where: {
        id: blockedDateId,
        storeId,
      },
    });

    if (!existing) {
      throw new NotFoundError('Blocked date not found');
    }

    await prisma.blockedDate.delete({
      where: { id: blockedDateId },
    });

    return { success: true };
  },

  /**
   * Bloquea múltiples fechas (útil para vacaciones)
   */
  async createMany(
    storeId: string,
    dates: { date: string; reason?: string }[]
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const validDates = dates.filter((d) => new Date(d.date) >= today);

    if (validDates.length === 0) {
      throw new BadRequestError('No valid dates to block');
    }

    const results = await Promise.all(
      validDates.map(async (d) => {
        try {
          return await this.create(storeId, d);
        } catch (error) {
          // Ignorar duplicados
          return null;
        }
      })
    );

    return results.filter((r) => r !== null);
  },
};      