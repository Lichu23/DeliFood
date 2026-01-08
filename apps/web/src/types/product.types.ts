  import { Category } from './category.types';

  export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
    isAvailable: boolean; // Changed from 'available'
    sortOrder: number;
    categoryId: string;
    storeId: string;
    createdAt: string;
    updatedAt: string;
    category?: Category;
  }

  export interface CreateProductData {
    name: string;
    description?: string;
    price: number;
    image?: string;
    isAvailable?: boolean; // Changed from 'available'
    categoryId: string;
  }

  export interface UpdateProductData {
    name?: string;
    description?: string;
    price?: number;
    image?: string;
    isAvailable?: boolean; // Changed from 'available'
    categoryId?: string;
    sortOrder?: number;
  }

  export interface ProductListResponse {
    success: boolean;
    data: Product[];
  }

  export interface ProductResponse {
    success: boolean;
    data: Product;
  }

  export interface ToggleAvailabilityResponse {
    success: boolean;
    data: {
      isAvailable: boolean; // Changed from 'available'
    };
  }
