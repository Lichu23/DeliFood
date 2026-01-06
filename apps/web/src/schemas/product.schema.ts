import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(200, "El nombre no puede exceder 200 caracteres"),
  description: z
    .string()
    .max(1000, "La descripción no puede exceder 1000 caracteres")
    .optional()
    .or(z.literal("")),
  price: z
    .number({
      error: "El precio es requerido",
    })
    .positive("El precio debe ser mayor a 0")
    .max(999999.99, "El precio no puede exceder 999,999.99"),
  imageUrl: z.url("URL de imagen inválida").optional().or(z.literal("")),
  isAvailable: z.boolean().default(true),
  categoryId: z.string().min(1, "La categoría es requerida"),
});

export const updateProductSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(200, "El nombre no puede exceder 200 caracteres")
    .optional(),
  description: z
    .string()
    .max(1000, "La descripción no puede exceder 1000 caracteres")
    .optional()
    .or(z.literal("")),
  price: z
    .number()
    .positive("El precio debe ser mayor a 0")
    .max(999999.99, "El precio no puede exceder 999,999.99")
    .optional(),
  imageUrl: z
    .string()
    .url("URL de imagen inválida")
    .optional()
    .or(z.literal("")),
  isAvailable: z.boolean().optional(),
  categoryId: z.string().min(1, "La categoría es requerida").optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export type CreateProductFormData = z.infer<typeof createProductSchema>;
export type UpdateProductFormData = z.infer<typeof updateProductSchema>;
