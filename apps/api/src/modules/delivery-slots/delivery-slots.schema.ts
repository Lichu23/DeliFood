import { z } from 'zod';

export const createDeliverySlotSchema = z.object({
  body: z.object({
    dayOfWeek: z.number().min(0).max(6, 'Day must be between 0 (Sunday) and 6 (Saturday)'),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    maxOrdersPerHour: z.number().min(1, 'Must accept at least 1 order per hour'),
  }),
  params: z.object({
    storeId: z.string().min(1, 'Store ID is required'),
  }),
});

export const updateDeliverySlotSchema = z.object({
  body: z.object({
    dayOfWeek: z.number().min(0).max(6).optional(),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
    maxOrdersPerHour: z.number().min(1).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    storeId: z.string().min(1, 'Store ID is required'),
    slotId: z.string().min(1, 'Slot ID is required'),
  }),
});

export const deleteDeliverySlotSchema = z.object({
  params: z.object({
    storeId: z.string().min(1, 'Store ID is required'),
    slotId: z.string().min(1, 'Slot ID is required'),
  }),
});

export type CreateDeliverySlotInput = z.infer<typeof createDeliverySlotSchema>;
export type UpdateDeliverySlotInput = z.infer<typeof updateDeliverySlotSchema>;