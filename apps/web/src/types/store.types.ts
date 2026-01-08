  import { Category } from './category.types';
  import { Product } from './product.types';
  import { DeliveryZone } from './checkout.types';

  export interface PublicStore {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    currency: 'EUR' | 'ARS';
    isActive: boolean;
    categories: Category[];
    products: Product[];
    deliveryZones: DeliveryZone[];
    paymentMethods: {
      cash: boolean;
      transfer: boolean;
    };
  }

  export interface PublicStoreResponse {
    success: boolean;
    data: PublicStore;
  }

  export interface CreatePublicOrderData {
    items: Array<{
      productId: string;
      quantity: number;
    }>;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    deliveryAddress: string;
    deliveryCity: string;
    deliveryPostalCode?: string;
    deliveryNotes?: string;
    deliveryZoneId: string;
    orderType: 'IMMEDIATE' | 'SCHEDULED';
    scheduledDate?: string;
    scheduledTimeSlot?: string;
    paymentMethod: 'CASH' | 'TRANSFER';
  }

  export interface PublicOrderResponse {
    success: boolean;
    data: {
      id: string;
      orderNumber: string;
      status: string;
      total: number;
      estimatedDeliveryTime?: string;
    };
  }