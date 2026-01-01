import { z } from 'zod';

// Schema para crear pedido (público - cliente)
export const createOrderSchema = z.object({
  body: z.object({
    // Cliente
    customerName: z.string().min(2, 'Name must be at least 2 characters'),
    customerPhone: z.string().min(6, 'Phone is required'),
    customerEmail: z.string().email('Invalid email').optional(),
    customerAddress: z.string().min(5, 'Address is required'),
    customerLat: z.number().min(-90).max(90),
    customerLng: z.number().min(-180).max(180),
    customerNotes: z.string().optional(),

    // Tipo de pedido
    type: z.enum(['IMMEDIATE', 'SCHEDULED']),

    // Para pedidos programados
    scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
    scheduledSlotStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    scheduledSlotEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),

    // Pago
    paymentMethod: z.enum(['CASH', 'TRANSFER']),

    // Items
    items: z.array(z.object({
      productId: z.string().min(1, 'Product ID is required'),
      quantity: z.number().int().min(1, 'Quantity must be at least 1'),
      notes: z.string().optional(),
    })).min(1, 'At least one item is required'),
  }).refine((data) => {
    // Si es programado, requiere fecha y franja
    if (data.type === 'SCHEDULED') {
      return data.scheduledDate && data.scheduledSlotStart && data.scheduledSlotEnd;
    }
    return true;
  }, {
    message: 'Scheduled orders require date and time slot',
    path: ['scheduledDate'],
  }),
  params: z.object({
    slug: z.string().min(1, 'Store slug is required'),
  }),
});

// Schema para actualizar estado
export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['CONFIRMED', 'PREPARING', 'READY', 'ON_THE_WAY', 'DELIVERED']),
  }),
  params: z.object({
    storeId: z.string().min(1, 'Store ID is required'),
    orderId: z.string().min(1, 'Order ID is required'),
  }),
});

// Schema para asignar repartidor
export const assignDeliverySchema = z.object({
  body: z.object({
    deliveryUserId: z.string().min(1, 'Delivery user ID is required'),
  }),
  params: z.object({
    storeId: z.string().min(1, 'Store ID is required'),
    orderId: z.string().min(1, 'Order ID is required'),
  }),
});

// Schema para cancelar pedido
export const cancelOrderSchema = z.object({
  body: z.object({
    reason: z.string().min(1, 'Cancellation reason is required'),
  }),
  params: z.object({
    storeId: z.string().min(1, 'Store ID is required'),
    orderId: z.string().min(1, 'Order ID is required'),
  }),
});

// Schema para confirmar pago
export const confirmPaymentSchema = z.object({
  params: z.object({
    storeId: z.string().min(1, 'Store ID is required'),
    orderId: z.string().min(1, 'Order ID is required'),
  }),
});

// Schema para cancelar pedido (cliente)
export const customerCancelOrderSchema = z.object({
  params: z.object({
    orderId: z.string().min(1, 'Order ID is required'),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type AssignDeliveryInput = z.infer<typeof assignDeliverySchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;