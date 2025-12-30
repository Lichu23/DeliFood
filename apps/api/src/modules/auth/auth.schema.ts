import { z } from 'zod';

// Schema para franjas horarias
const deliverySlotSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  maxOrdersPerHour: z.number().min(1),
});

// Schema para zonas de entrega
const deliveryZoneSchema = z.object({
  name: z.string().min(1, 'Zone name is required'),
  maxDistance: z.number().min(0.1, 'Max distance must be greater than 0'),
  deliveryFee: z.number().min(0),
  minOrder: z.number().min(0),
});

export const registerSchema = z.object({
  body: z.object({
    // Usuario
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().min(6, 'Phone is required'),

    // Tienda
    storeName: z.string().min(2, 'Store name must be at least 2 characters'),
    storeAddress: z.string().min(5, 'Store address is required'),
    storeLatitude: z.number().min(-90).max(90),
    storeLongitude: z.number().min(-180).max(180),
    storePhone: z.string().min(6, 'Store phone is required'),
    storeLogo: z.string().url('Invalid logo URL'),
    currency: z.enum(['EUR', 'ARS']),

    // Pagos
    acceptsCash: z.boolean(),
    acceptsTransfer: z.boolean(),
    bankName: z.string().optional(),
    bankAccountHolder: z.string().optional(),
    bankAccountNumber: z.string().optional(),
    bankAlias: z.string().optional(),

    // Reservas
    minAdvanceHours: z.number().min(1, 'Minimum 1 hour advance'),
    maxAdvanceDays: z.number().min(1, 'Minimum 1 day advance'),

    // Cancelaciones
    immediateCancelMinutes: z.number().min(0),
    scheduledCancelHours: z.number().min(0),

    // Franjas horarias (al menos una)
    deliverySlots: z.array(deliverySlotSchema).min(1, 'At least one delivery slot is required'),

    // Zonas de entrega (al menos una)
    deliveryZones: z.array(deliveryZoneSchema).min(1, 'At least one delivery zone is required'),
  }).refine((data) => {
    // Al menos un método de pago debe estar activo
    return data.acceptsCash || data.acceptsTransfer;
  }, {
    message: 'At least one payment method must be accepted',
    path: ['acceptsCash'],
  }).refine((data) => {
    // Si acepta transferencia, los datos bancarios son obligatorios
    if (data.acceptsTransfer) {
      return data.bankName && data.bankAccountHolder && data.bankAccountNumber;
    }
    return true;
  }, {
    message: 'Bank details are required when accepting transfers',
    path: ['bankName'],
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email('Invalid email address'),
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
    phone: z.string().min(6, 'Phone must be at least 6 characters').optional(),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];