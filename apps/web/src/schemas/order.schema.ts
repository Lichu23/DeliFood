  import { z } from 'zod';

  export const orderItemSchema = z.object({
    productId: z.string().min(1, 'Product is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
  });

  export const createOrderSchema = z
    .object({
      type: z.enum(['IMMEDIATE', 'SCHEDULED'], {
        error: 'Order type is required',
      }),
      paymentMethod: z.enum(['CASH', 'TRANSFER'], {
        error: 'Payment method is required',
      }),

      // Customer info
      customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
      customerEmail: z.string().email('Invalid email address'),
      customerPhone: z.string().min(5, 'Phone number is required'),
      deliveryAddress: z.string().min(5, 'Delivery address is required'),
      deliveryCity: z.string().min(2, 'City is required'),
      deliveryPostalCode: z.string().optional(),
      customerNotes: z.string().optional(),

      // Delivery
      deliveryZoneId: z.string().min(1, 'Delivery zone is required'),

      // Scheduled order
      scheduledDate: z.string().optional(),
      scheduledSlotId: z.string().optional(),

      // Items
      items: z.array(orderItemSchema).min(1, 'At least one item is required'),
    })
    .refine(
      (data) => {
        if (data.type === 'SCHEDULED') {
          return !!data.scheduledDate && !!data.scheduledSlotId;
        }
        return true;
      },
      {
        message: 'Scheduled date and slot are required for scheduled orders',
        path: ['scheduledDate'],
      }
    );

  export const updateOrderStatusSchema = z.object({
    status: z.enum([
      'PENDING',
      'CONFIRMED',
      'PREPARING',
      'READY',
      'ON_THE_WAY',
      'DELIVERED',
      'CANCELLED',
    ]),
  });

  export const assignDeliveryPersonSchema = z.object({
    deliveryPersonId: z.string().min(1, 'Delivery person is required'),
  });

  export const cancelOrderSchema = z.object({
    reason: z.string().min(5, 'Cancellation reason must be at least 5 characters'),
  });

  export const orderFiltersSchema = z.object({
    status: z
      .union([
        z.enum([
          'PENDING',
          'CONFIRMED',
          'PREPARING',
          'READY',
          'ON_THE_WAY',
          'DELIVERED',
          'CANCELLED',
        ]),
        z.array(
          z.enum([
            'PENDING',
            'CONFIRMED',
            'PREPARING',
            'READY',
            'ON_THE_WAY',
            'DELIVERED',
            'CANCELLED',
          ])
        ),
      ])
      .optional(),
    type: z.enum(['IMMEDIATE', 'SCHEDULED']).optional(),
    paymentStatus: z.enum(['PENDING', 'CONFIRMED']).optional(),
    deliveryPersonId: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    search: z.string().optional(),
  });

  export type CreateOrderInput = z.infer<typeof createOrderSchema>;
  export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
  export type AssignDeliveryPersonInput = z.infer<typeof assignDeliveryPersonSchema>;
  export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
  export type OrderFiltersInput = z.infer<typeof orderFiltersSchema>;