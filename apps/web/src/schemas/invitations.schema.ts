// apps/web/src/schemas/invitations.schema.ts
import { z } from 'zod';

export const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  phone: z.string().optional(),
});

export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;