import prisma from '../../lib/prisma';
import { OrderStatus } from '@prisma/client';

export const metricsService = {
  /**
   * Obtiene métricas de una tienda
   */
  async getStoreMetrics(
    storeId: string,
    options?: { from?: Date; to?: Date }
  ) {
    const where: any = { storeId };

    if (options?.from || options?.to) {
      where.createdAt = {};
      if (options.from) {
        where.createdAt.gte = options.from;
      }
      if (options.to) {
        where.createdAt.lte = options.to;
      }
    }

    // Total de pedidos
    const totalOrders = await prisma.order.count({ where });

    // Pedidos por estado
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      where,
      _count: { id: true },
    });

    // Pedidos completados
    const completedWhere = { ...where, status: OrderStatus.DELIVERED };
    const completedOrders = await prisma.order.count({ where: completedWhere });

    // Ingresos totales (solo pedidos entregados)
    const revenue = await prisma.order.aggregate({
      where: completedWhere,
      _sum: { total: true },
    });

    // Valor promedio de pedido
    const avgOrderValue = await prisma.order.aggregate({
      where: completedWhere,
      _avg: { total: true },
    });

    // Tiempo promedio de entrega (en minutos)
    const deliveredOrders = await prisma.order.findMany({
      where: {
        ...where,
        status: OrderStatus.DELIVERED,
        deliveredAt: { not: null },
        confirmedAt: { not: null },
      },
      select: {
        confirmedAt: true,
        deliveredAt: true,
      },
    });

    let avgDeliveryTime = 0;
    if (deliveredOrders.length > 0) {
      const totalMinutes = deliveredOrders.reduce((acc, order) => {
        const diff = order.deliveredAt!.getTime() - order.confirmedAt!.getTime();
        return acc + diff / 60000;
      }, 0);
      avgDeliveryTime = Math.round(totalMinutes / deliveredOrders.length);
    }

    // Pedidos cancelados
    const cancelledOrders = await prisma.order.count({
      where: { ...where, status: OrderStatus.CANCELLED },
    });

    // Top 5 productos más vendidos
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId', 'name'],
      where: {
        order: completedWhere,
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    // Pedidos por día (últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const ordersByDay = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        storeId,
        createdAt: { gte: sevenDaysAgo },
      },
      _count: { id: true },
    });

    return {
      totalOrders,
      completedOrders,
      cancelledOrders,
      revenue: revenue._sum.total || 0,
      avgOrderValue: avgOrderValue._avg.total || 0,
      avgDeliveryTime,
      ordersByStatus: ordersByStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      topProducts: topProducts.map((p) => ({
        productId: p.productId,
        name: p.name,
        totalSold: p._sum.quantity || 0,
      })),
      conversionRate: totalOrders > 0 
        ? Math.round((completedOrders / totalOrders) * 100) 
        : 0,
    };
  },

  /**
   * Obtiene métricas en tiempo real (hoy)
   */
  async getTodayMetrics(storeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getStoreMetrics(storeId, { from: today, to: tomorrow });
  },
};