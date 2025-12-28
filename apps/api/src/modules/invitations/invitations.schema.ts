import { z } from 'zod';

export const createInvitationSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    role: z.enum(['ADMIN', 'CASHIER', 'DELIVERY'], {
      errorMap: () => ({ message: 'Role must be ADMIN, CASHIER, or DELIVERY' }),
    }),
  }),
  params: z.object({
    storeId: z.string().min(1, 'Store ID is required'),
  }),
});

export const acceptInvitationSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Invitation token is required'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
  }),
});

export const acceptInvitationExistingUserSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Invitation token is required'),
  }),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>['body'];
