import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    // Datos del usuario
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
    
    // Datos de la tienda
    storeName: z.string().min(2, 'Store name must be at least 2 characters'),
    storeDescription: z.string().optional(),
    storePhone: z.string().optional(),
    storeAddress: z.string().min(5, 'Store address is required'),
    storeLatitude: z.number().min(-90).max(90),
    storeLongitude: z.number().min(-180).max(180),
    orderMode: z.enum(['IMMEDIATE', 'SCHEDULED', 'HYBRID']).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    phone: z.string().optional(),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
