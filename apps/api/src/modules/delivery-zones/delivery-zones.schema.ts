import { z } from 'zod';

export const createDeliveryZoneSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    maxDistance: z.number().min(0.1, 'Max distance must be greater than 0'),
    deliveryFee: z.number().min(0, 'Delivery fee must be positive'),
    minOrder: z.number().min(0, 'Minimum order must be positive'),
  }),
  params: z.object({
    storeId: z.string().min(1, 'Store ID is required'),
  }),
});

export const updateDeliveryZoneSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    maxDistance: z.number().min(0.1, 'Max distance must be greater than 0').optional(),
    deliveryFee: z.number().min(0, 'Delivery fee must be positive').optional(),
    minOrder: z.number().min(0, 'Minimum order must be positive').optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    storeId: z.string().min(1, 'Store ID is required'),
    zoneId: z.string().min(1, 'Zone ID is required'),
  }),
});

export const deleteDeliveryZoneSchema = z.object({
  params: z.object({
    storeId: z.string().min(1, 'Store ID is required'),
    zoneId: z.string().min(1, 'Zone ID is required'),
  }),
});

export type CreateDeliveryZoneInput = z.infer<typeof createDeliveryZoneSchema>;
export type UpdateDeliveryZoneInput = z.infer<typeof updateDeliveryZoneSchema>;