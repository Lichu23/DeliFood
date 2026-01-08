  import { Product } from './product.types';

  export interface CartItem {
    product: Product;
    quantity: number;
  }

  export interface Cart {
    items: CartItem[];
    storeId: string;
    storeName: string;
    currency: 'EUR' | 'ARS';
  }

  export interface CartSummary {
    subtotal: number;
    deliveryFee: number;
    total: number;
    itemCount: number;
  }