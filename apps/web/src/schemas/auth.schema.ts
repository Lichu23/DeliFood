import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export const registerSchema = z.object({
  // Usuario
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  phone: z.string().min(6, 'Teléfono requerido'),

  // Tienda
  storeName: z.string().min(2, 'Mínimo 2 caracteres'),
  storeAddress: z.string().min(5, 'Dirección requerida'),
  storeLatitude: z.number().min(-90).max(90),
  storeLongitude: z.number().min(-180).max(180),
  storePhone: z.string().min(6, 'Teléfono requerido'),
  storeLogo: z.url('URL inválida'),
  currency: z.enum(['EUR', 'ARS']),

  // Pagos
  acceptsCash: z.boolean(),
  acceptsTransfer: z.boolean(),
  bankName: z.string().optional(),
  bankAccountHolder: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAlias: z.string().optional(),

  // Reservas
  minAdvanceHours: z.number().min(1),
  maxAdvanceDays: z.number().min(1),

  // Cancelaciones
  immediateCancelMinutes: z.number().min(0),
  scheduledCancelHours: z.number().min(0),

  // Franjas horarias
  deliverySlots: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string(),
    endTime: z.string(),
    maxOrdersPerHour: z.number().min(1),
  })).min(1, 'Al menos una franja horaria'),

  // Zonas de entrega
  deliveryZones: z.array(z.object({
    name: z.string().min(1),
    maxDistance: z.number().min(0.1),
    deliveryFee: z.number().min(0),
    minOrder: z.number().min(0),
  })).min(1, 'Al menos una zona de entrega'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;