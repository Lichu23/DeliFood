  export interface Category {
    id: string;
    name: string;
    description?: string;
    sortOrder: number;
    storeId: string;
    createdAt: string;
    updatedAt: string;
    _count?: {
      products: number;
    };
  }

  export interface CreateCategoryData {
    name: string;
    description?: string;
  }

  export interface UpdateCategoryData {
    name?: string;
    description?: string;
    sortOrder?: number;
  }

  export interface CategoryListResponse {
    success: boolean;
    data: Category[];
  }

  export interface CategoryResponse {
    success: boolean;
    data: Category;
  }