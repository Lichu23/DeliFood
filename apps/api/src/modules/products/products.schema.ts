import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional(),
    price: z.number().min(0, 'Price must be positive'),
    image: z.url('Invalid image URL').optional(),
    categoryId: z.string().optional(),
    sortOrder: z.number().int().min(0).optional(),
  }),
  params: z.object({
    storeId: z.string().min(1, 'Store ID is required'),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    description: z.string().optional(),
    price: z.number().min(0, 'Price must be positive').optional(),
    image: z.url('Invalid image URL').optional(),
    categoryId: z.string().nullable().optional(),
    sortOrder: z.number().int().min(0).optional(),
    isAvailable: z.boolean().optional(),
  }),
  params: z.object({
    storeId: z.string().min(1, 'Store ID is required'),
    productId: z.string().min(1, 'Product ID is required'),
  }),
});

export const deleteProductSchema = z.object({
  params: z.object({
    storeId: z.string().min(1, 'Store ID is required'),
    productId: z.string().min(1, 'Product ID is required'),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;