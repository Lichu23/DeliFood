import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional(),
    image: z.url('Invalid image URL').optional(),
    sortOrder: z.number().int().min(0).optional(),
  }),
  params: z.object({
    storeId: z.string().min(1, 'Store ID is required'),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    description: z.string().optional(),
    image: z.url('Invalid image URL').optional(),
    sortOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    storeId: z.string().min(1, 'Store ID is required'),
    categoryId: z.string().min(1, 'Category ID is required'),
  }),
});

export const deleteCategorySchema = z.object({
  params: z.object({
    storeId: z.string().min(1, 'Store ID is required'),
    categoryId: z.string().min(1, 'Category ID is required'),
  }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;