  import { z } from "zod";

  export const customerInfoSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    phone: z.string().min(9, "El teléfono debe tener al menos 9 dígitos"),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
  });

  export const deliveryAddressSchema = z.object({
    address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
    city: z.string().min(2, "La ciudad es requerida"),
    postalCode: z.string().optional(),
    notes: z.string().optional(),
    zoneId: z.string().min(1, "Selecciona una zona de entrega"),
  });

  export const deliveryTimeSchema = z.object({
    type: z.enum(["IMMEDIATE", "SCHEDULED"]),
    scheduledDate: z.string().optional(),
    scheduledTimeSlot: z.string().optional(),
  }).refine(
    (data) => {
      if (data.type === "SCHEDULED") {
        return !!data.scheduledDate && !!data.scheduledTimeSlot;
      }
      return true;
    },
    {
      message: "Selecciona una fecha y horario para el pedido programado",
    }
  );

  export const checkoutSchema = z.object({
    customerInfo: customerInfoSchema,
    deliveryAddress: deliveryAddressSchema,
    deliveryTime: deliveryTimeSchema,
    paymentMethod: z.enum(["CASH", "TRANSFER"]),
  });