import { z } from 'zod';

export const createBlockedDateSchema = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    reason: z.string().optional(),
  }),
  params: z.object({
    storeId: z.string().min(1, 'Store ID is required'),
  }),
});

export const deleteBlockedDateSchema = z.object({
  params: z.object({
    storeId: z.string().min(1, 'Store ID is required'),
    blockedDateId: z.string().min(1, 'Blocked date ID is required'),
  }),
});

export type CreateBlockedDateInput = z.infer<typeof createBlockedDateSchema>;