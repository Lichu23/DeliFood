import { z } from 'zod';

export const updateStoreSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    phone: z.string().optional(),
    email: z.email('Invalid email address').optional(),
    address: z.string().min(5).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    storeId: z.string().min(1),
  }),
});

export const updateStoreSettingsSchema = z.object({
  body: z.object({
    minOrderAmount: z.number().min(0).optional(),
    estimatedPrepTime: z.number().min(1).optional(),
    immediateCancelMinutes: z.number().min(0).optional(),
    scheduledCancelHours: z.number().min(0).optional(),
    allowCancellation: z.boolean().optional(),
    minAdvanceHours: z.number().min(1).optional(),
    maxAdvanceDays: z.number().min(1).optional(),
    bankName: z.string().optional(),
    bankAccountHolder: z.string().optional(),
    bankAccountNumber: z.string().optional(),
    bankAlias: z.string().optional(),
    acceptsCash: z.boolean().optional(),
    acceptsTransfer: z.boolean().optional(),
  }),
  params: z.object({
    storeId: z.string().min(1),
  }),
});

export const removeMemberSchema = z.object({
  params: z.object({
    storeId: z.string().min(1),
    memberId: z.string().min(1),
  }),
});

export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
export type UpdateStoreSettingsInput = z.infer<typeof updateStoreSettingsSchema>;
