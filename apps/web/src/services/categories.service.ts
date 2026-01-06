import axios from '@/lib/axios';
  import {
    Category,
    CategoryListResponse,
    CategoryResponse,
    CreateCategoryData,
    UpdateCategoryData,
  } from '@/types/category.types';

  export const categoriesService = {
    /**
     * Get all categories for a store
     */
    async list(storeId: string): Promise<Category[]> {
      const response = await axios.get<CategoryListResponse>(
        `/stores/${storeId}/categories`
      );
      return response.data.data;
    },

    /**
     * Get a single category by ID
     */
    async getById(storeId: string, categoryId: string): Promise<Category> {
      const response = await axios.get<CategoryResponse>(
        `/stores/${storeId}/categories/${categoryId}`
      );
      return response.data.data;
    },

    /**
     * Create a new category
     */
    async create(storeId: string, data: CreateCategoryData): Promise<Category> {
      const response = await axios.post<CategoryResponse>(
        `/stores/${storeId}/categories`,
        data
      );
      return response.data.data;
    },

    /**
     * Update a category
     */
    async update(
      storeId: string,
      categoryId: string,
      data: UpdateCategoryData
    ): Promise<Category> {
      const response = await axios.patch<CategoryResponse>(
        `/stores/${storeId}/categories/${categoryId}`,
        data
      );
      return response.data.data;
    },

    /**
     * Delete a category
     */
    async delete(storeId: string, categoryId: string): Promise<void> {
      await axios.delete(`/stores/${storeId}/categories/${categoryId}`);
    },

    /**
     * Update sort order of categories (for drag and drop)
     */
    async updateSortOrder(
      storeId: string,
      categories: { id: string; sortOrder: number }[]
    ): Promise<void> {
      // If backend has a bulk update endpoint, use it
      // Otherwise, update each category individually
      await Promise.all(
        categories.map((category) =>
          this.update(storeId, category.id, { sortOrder: category.sortOrder })
        )
      );
    },
  };