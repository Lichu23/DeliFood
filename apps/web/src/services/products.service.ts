import axios from "@/lib/axios";
import {
  Product,
  ProductListResponse,
  ProductResponse,
  CreateProductData,
  UpdateProductData,
  ToggleAvailabilityResponse,
} from "@/types/product.types";

export const productsService = {
  /**
   * Get all products for a store
   */
  async list(storeId: string): Promise<Product[]> {
      const response = await axios.get<ProductListResponse>(
        `/stores/${storeId}/products?includeUnavailable=true`  // ← Add this query param
      );
      return response.data.data;
    },

  /**
   * Get a single product by ID
   */
  async getById(storeId: string, productId: string): Promise<Product> {
    const response = await axios.get<ProductResponse>(
      `/stores/${storeId}/products/${productId}`
    );
    return response.data.data;
  },

  /**
   * Create a new product
   */
  async create(storeId: string, data: CreateProductData): Promise<Product> {
    const response = await axios.post<ProductResponse>(
      `/stores/${storeId}/products`,
      data
    );
    return response.data.data;
  },

  /**
   * Update a product
   */
  async update(
    storeId: string,
    productId: string,
    data: UpdateProductData
  ): Promise<Product> {
    const response = await axios.patch<ProductResponse>(
      `/stores/${storeId}/products/${productId}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete a product
   */
  async delete(storeId: string, productId: string): Promise<void> {
    await axios.delete(`/stores/${storeId}/products/${productId}`);
  },

  /**
   * Toggle product availability
   */
  async toggleAvailability(
    storeId: string,
    productId: string
  ): Promise<boolean> {
    const response = await axios.post<ToggleAvailabilityResponse>(
      `/stores/${storeId}/products/${productId}/toggle-availability`
    );
    return response.data.data.isAvailable; // Changed from 'available'
  },

  /**
   * Bulk delete products
   */
  async bulkDelete(storeId: string, productIds: string[]): Promise<void> {
    await Promise.all(
      productIds.map((productId) => this.delete(storeId, productId))
    );
  },

  /**
   * Bulk toggle availability
   */
  async bulkToggleAvailability(
    storeId: string,
    productIds: string[],
    isAvailable: boolean // Changed from 'available'
  ): Promise<void> {
    await Promise.all(
      productIds.map(
        (productId) => this.update(storeId, productId, { isAvailable }) // Changed from 'available'
      )
    );
  },
};
