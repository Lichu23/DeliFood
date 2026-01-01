import {
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  CancelledBy,
  RefundStatus,
} from "@prisma/client";
import prisma from "../../lib/prisma";
import { calculateRoute } from "../../lib/openroute";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "../../utils/errors";
import { deliveryZonesService } from "../delivery-zones/delivery-zones.service";
import { blockedDatesService } from "../blocked-dates/blocked-dates.service";

export const ordersService = {
  /**
   * Crea un nuevo pedido (público - cliente)
   */
  async create(
    storeSlug: string,
    data: {
      customerName: string;
      customerPhone: string;
      customerEmail?: string;
      customerAddress: string;
      customerLat: number;
      customerLng: number;
      customerNotes?: string;
      type: "IMMEDIATE" | "SCHEDULED";
      scheduledDate?: string;
      scheduledSlotStart?: string;
      scheduledSlotEnd?: string;
      paymentMethod: "CASH" | "TRANSFER";
      items: { productId: string; quantity: number; notes?: string }[];
    }
  ) {
    // Obtener tienda
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug },
      include: { settings: true },
    });

    if (!store || !store.isActive) {
      throw new NotFoundError("Store not found");
    }

    // Calcular distancia y buscar zona
    const distance = await this.calculateDistance(
      { lat: store.latitude, lng: store.longitude },
      { lat: data.customerLat, lng: data.customerLng }
    );

    const zone = await deliveryZonesService.findZoneByDistance(
      store.id,
      distance
    );

    if (!zone) {
      throw new BadRequestError(
        "Delivery address is outside our coverage area"
      );
    }

    // Validar pedidos programados
    if (data.type === "SCHEDULED") {
      await this.validateScheduledOrder(
        store.id,
        data.scheduledDate!,
        data.scheduledSlotStart!,
        data.scheduledSlotEnd!,
        store.settings!
      );
    }

    // Obtener productos y calcular totales
    const productIds = data.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        storeId: store.id,
        isAvailable: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestError("Some products are not available");
    }

    // Calcular subtotal
    let subtotal = 0;
    const orderItems = data.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const totalPrice = product.price * item.quantity;
      subtotal += totalPrice;

      return {
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice,
        notes: item.notes,
      };
    });

    // Validar pedido mínimo
    if (subtotal < zone.minOrder) {
      throw new BadRequestError(
        `Minimum order for this zone is ${zone.minOrder}`
      );
    }

    const deliveryFee = zone.deliveryFee;
    const total = subtotal + deliveryFee;

    // Obtener siguiente número de orden
    const lastOrder = await prisma.order.findFirst({
      where: { storeId: store.id },
      orderBy: { orderNumber: "desc" },
    });
    const orderNumber = (lastOrder?.orderNumber || 0) + 1;

    // Determinar estado inicial
    const initialStatus =
      data.paymentMethod === "CASH"
        ? OrderStatus.CONFIRMED
        : OrderStatus.PENDING;
    const paymentStatus =
      data.paymentMethod === "CASH"
        ? PaymentStatus.CONFIRMED
        : PaymentStatus.PENDING;

    // Crear pedido
    const order = await prisma.order.create({
      data: {
        storeId: store.id,
        orderNumber,
        type: data.type as OrderType,
        status: initialStatus,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        customerAddress: data.customerAddress,
        customerLat: data.customerLat,
        customerLng: data.customerLng,
        customerNotes: data.customerNotes,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        scheduledSlotStart: data.scheduledSlotStart,
        scheduledSlotEnd: data.scheduledSlotEnd,
        subtotal,
        deliveryFee,
        total,
        paymentMethod: data.paymentMethod as PaymentMethod,
        paymentStatus,
        confirmedAt: data.paymentMethod === "CASH" ? new Date() : null,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      type: order.type,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      estimatedMinutes: order.estimatedMinutes,
      createdAt: order.createdAt,
    };
  },

  /**
   * Lista pedidos de una tienda
   */
  async list(
    storeId: string,
    options?: {
      status?: OrderStatus;
      type?: OrderType;
      date?: string;
      assignedToId?: string;
    }
  ) {
    const where: any = { storeId };

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.type) {
      where.type = options.type;
    }

    if (options?.date) {
      const date = new Date(options.date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      where.createdAt = {
        gte: date,
        lt: nextDay,
      };
    }

    if (options?.assignedToId) {
      where.assignedToId = options.assignedToId;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return orders;
  },

  /**
   * Obtiene un pedido por ID
   */
  async getById(storeId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        storeId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        store: {
          select: {
            name: true,
            phone: true,
            address: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    return order;
  },

  /**
   * Obtiene un pedido para tracking público
   */
  async getForTracking(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          select: {
            name: true,
            quantity: true,
            totalPrice: true,
          },
        },
        store: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      type: order.type,
      estimatedMinutes: order.estimatedMinutes,
      customerName: order.customerName,
      customerAddress: order.customerAddress,
      items: order.items,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      store: order.store,
      createdAt: order.createdAt,
      confirmedAt: order.confirmedAt,
      preparingAt: order.preparingAt,
      readyAt: order.readyAt,
      onTheWayAt: order.onTheWayAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
      cancelReason: order.cancelReason,
    };
  },

  /**
   * Actualiza el estado de un pedido
   */
  async updateStatus(storeId: string, orderId: string, status: OrderStatus) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        storeId,
      },
      include: {
        store: true,
      },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    // Validar transición de estado
    this.validateStatusTransition(order.status, status);

    // Si pasa a ON_THE_WAY, calcular ETA
    let estimatedMinutes = order.estimatedMinutes;
    if (status === OrderStatus.ON_THE_WAY && !order.assignedToId) {
      throw new BadRequestError(
        "Order must be assigned to a delivery person first"
      );
    }

    if (status === OrderStatus.ON_THE_WAY) {
      const route = await calculateRoute(
        { lat: order.store.latitude, lng: order.store.longitude },
        { lat: order.customerLat, lng: order.customerLng }
      );
      estimatedMinutes = route.durationMinutes;
    }

    // Actualizar timestamps según estado
    const timestamps: any = {};
    switch (status) {
      case OrderStatus.CONFIRMED:
        timestamps.confirmedAt = new Date();
        break;
      case OrderStatus.PREPARING:
        timestamps.preparingAt = new Date();
        break;
      case OrderStatus.READY:
        timestamps.readyAt = new Date();
        break;
      case OrderStatus.ON_THE_WAY:
        timestamps.onTheWayAt = new Date();
        break;
      case OrderStatus.DELIVERED:
        timestamps.deliveredAt = new Date();
        break;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        estimatedMinutes,
        ...timestamps,
      },
    });

    return updatedOrder;
  },

  /**
   * Asigna un repartidor al pedido
   */
  async assignDelivery(
    storeId: string,
    orderId: string,
    deliveryUserId: string
  ) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        storeId,
      },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    // Verificar que el usuario es repartidor de la tienda
    const member = await prisma.storeMember.findFirst({
      where: {
        storeId,
        userId: deliveryUserId,
        role: "DELIVERY",
        isActive: true,
      },
    });

    if (!member) {
      throw new BadRequestError("User is not a delivery person for this store");
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        assignedToId: deliveryUserId,
        assignedAt: new Date(),
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    return updatedOrder;
  },

  /**
   * Confirma el pago de un pedido (transferencia)
   */
  async confirmPayment(storeId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        storeId,
      },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (order.paymentMethod !== PaymentMethod.TRANSFER) {
      throw new BadRequestError("Order is not a transfer payment");
    }

    if (order.paymentStatus === PaymentStatus.CONFIRMED) {
      throw new BadRequestError("Payment is already confirmed");
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.CONFIRMED,
        status: OrderStatus.PREPARING,
        confirmedAt: new Date(),
        preparingAt: new Date(),
      },
    });

    return updatedOrder;
  },
  /**
   * Cancela un pedido (tienda)
   */
  async cancelByStore(storeId: string, orderId: string, reason: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        storeId,
      },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestError("Cannot cancel a delivered order");
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestError("Order is already cancelled");
    }

    // Determinar si necesita reembolso
    let refundStatus: RefundStatus | null = null;
    if (
      order.paymentMethod === PaymentMethod.TRANSFER &&
      order.paymentStatus === PaymentStatus.CONFIRMED
    ) {
      refundStatus = RefundStatus.PENDING;
    } else if (order.paymentMethod === PaymentMethod.CASH) {
      refundStatus = RefundStatus.NOT_REQUIRED;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelReason: reason,
        cancelledBy: CancelledBy.STORE,
        refundStatus,
      },
    });

    return updatedOrder;
  },

  /**
   * Cancela un pedido (cliente)
   */
  async cancelByCustomer(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        store: {
          include: { settings: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestError("Cannot cancel a delivered order");
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestError("Order is already cancelled");
    }

    // Verificar ventana de cancelación
    const settings = order.store.settings!;
    const now = new Date();
    const orderCreatedAt = new Date(order.createdAt);

    if (order.type === OrderType.IMMEDIATE) {
      const cancelWindowMs = settings.immediateCancelMinutes * 60 * 1000;
      if (now.getTime() - orderCreatedAt.getTime() > cancelWindowMs) {
        throw new BadRequestError("Cancellation window has expired");
      }
    } else {
      // Pedido programado
      const scheduledDateTime = new Date(order.scheduledDate!);
      const [hours, minutes] = order.scheduledSlotStart!.split(":").map(Number);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      const cancelDeadline = new Date(scheduledDateTime);
      cancelDeadline.setHours(
        cancelDeadline.getHours() - settings.scheduledCancelHours
      );

      if (now > cancelDeadline) {
        throw new BadRequestError("Cancellation window has expired");
      }
    }

    // Determinar si necesita reembolso
    let refundStatus: RefundStatus | null = null;
    if (
      order.paymentMethod === PaymentMethod.TRANSFER &&
      order.paymentStatus === PaymentStatus.CONFIRMED
    ) {
      refundStatus = RefundStatus.PENDING;
    } else if (order.paymentMethod === PaymentMethod.CASH) {
      refundStatus = RefundStatus.NOT_REQUIRED;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelReason: "Cancelled by customer",
        cancelledBy: CancelledBy.CUSTOMER,
        refundStatus,
      },
    });

    return updatedOrder;
  },

  /**
   * Valida transición de estado
   */
  validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus) {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
      [OrderStatus.READY]: [OrderStatus.ON_THE_WAY, OrderStatus.CANCELLED],
      [OrderStatus.ON_THE_WAY]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestError(
        `Cannot transition from ${currentStatus} to ${newStatus}`
      );
    }
  },

  /**
   * Valida pedido programado
   */
  async validateScheduledOrder(
    storeId: string,
    date: string,
    slotStart: string,
    slotEnd: string,
    settings: { minAdvanceHours: number; maxAdvanceDays: number }
  ) {
    const scheduledDate = new Date(date);
    const now = new Date();

    // Verificar anticipación mínima
    const minAdvanceMs = settings.minAdvanceHours * 60 * 60 * 1000;
    const [startHours, startMinutes] = slotStart.split(":").map(Number);
    const scheduledDateTime = new Date(scheduledDate);
    scheduledDateTime.setHours(startHours, startMinutes, 0, 0);

    if (scheduledDateTime.getTime() - now.getTime() < minAdvanceMs) {
      throw new BadRequestError(
        `Orders must be placed at least ${settings.minAdvanceHours} hours in advance`
      );
    }

    // Verificar anticipación máxima
    const maxAdvanceMs = settings.maxAdvanceDays * 24 * 60 * 60 * 1000;
    if (scheduledDateTime.getTime() - now.getTime() > maxAdvanceMs) {
      throw new BadRequestError(
        `Orders cannot be placed more than ${settings.maxAdvanceDays} days in advance`
      );
    }

    // Verificar fecha no bloqueada
    const isBlocked = await blockedDatesService.isDateBlocked(
      storeId,
      scheduledDate
    );
    if (isBlocked) {
      throw new BadRequestError("Selected date is not available");
    }

    // Verificar que existe el slot
    const dayOfWeek = scheduledDate.getDay();
    const slot = await prisma.deliverySlot.findFirst({
      where: {
        storeId,
        dayOfWeek,
        startTime: slotStart,
        endTime: slotEnd,
        isActive: true,
      },
    });

    if (!slot) {
      throw new BadRequestError("Selected time slot is not available");
    }

    // Verificar capacidad del slot
    const ordersInSlot = await prisma.order.count({
      where: {
        storeId,
        type: OrderType.SCHEDULED,
        scheduledDate: scheduledDate,
        scheduledSlotStart: slotStart,
        status: { notIn: [OrderStatus.CANCELLED] },
      },
    });

    // Calcular horas en el slot
    const [endHours, endMinutes] = slotEnd.split(":").map(Number);
    const slotHours =
      (endHours * 60 + endMinutes - startHours * 60 - startMinutes) / 60;
    const maxOrders = slot.maxOrdersPerHour * slotHours;

    if (ordersInSlot >= maxOrders) {
      throw new BadRequestError("Selected time slot is full");
    }
  },

  /**
   * Calcula distancia entre dos puntos
   */
  async calculateDistance(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<number> {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(destination.lat - origin.lat);
    const dLng = this.toRad(destination.lng - origin.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(origin.lat)) *
        Math.cos(this.toRad(destination.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10;
  },

  toRad(deg: number): number {
    return deg * (Math.PI / 180);
  },
};
