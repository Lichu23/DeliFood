  export type OrderStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'PREPARING'
    | 'READY'
    | 'ON_THE_WAY'
    | 'DELIVERED'
    | 'CANCELLED';

  export type OrderType = 'IMMEDIATE' | 'SCHEDULED';

  export type PaymentMethod = 'CASH' | 'TRANSFER';

  export type PaymentStatus = 'PENDING' | 'CONFIRMED';

  export interface OrderCustomer {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode?: string;
    notes?: string;
  }

  export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    product: {
      id: string;
      name: string;
      price: number;
      imageUrl?: string;
    };
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }

  export interface Order {
    id: string;
    orderNumber: string;
    storeId: string;
    status: OrderStatus;
    type: OrderType;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;

    // Customer info
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryCity: string;
    deliveryPostalCode?: string;
    customerNotes?: string;

    // Delivery info
    deliveryZoneId: string;
    deliveryZone?: {
      id: string;
      name: string;
      deliveryFee: number;
    };
    deliveryPersonId?: string;
    deliveryPerson?: {
      id: string;
      name: string;
      email: string;
    };
    estimatedDeliveryTime?: string;

    // Scheduled order
    scheduledDate?: string;
    scheduledSlotId?: string;
    scheduledSlot?: {
      id: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    };

    // Pricing
    subtotal: number;
    deliveryFee: number;
    total: number;

    // Items
    items: OrderItem[];

    // Status history
    statusHistory?: OrderStatusHistory[];

    // Timestamps
    createdAt: string;
    updatedAt: string;
    cancelledAt?: string;
    cancellationReason?: string;
  }

  export interface OrderStatusHistory {
    id: string;
    orderId: string;
    status: OrderStatus;
    changedBy?: {
      id: string;
      name: string;
    };
    createdAt: string;
  }

  export interface OrderFilters {
    status?: OrderStatus | OrderStatus[];
    type?: OrderType;
    paymentStatus?: PaymentStatus;
    deliveryPersonId?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }

  export interface OrdersListResponse {
    orders: Order[];
    total: number;
    page: number;
    limit: number;
  }

  export interface CreateOrderDto {
    type: OrderType;
    paymentMethod: PaymentMethod;

    // Customer info
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryCity: string;
    deliveryPostalCode?: string;
    customerNotes?: string;

    // Delivery
    deliveryZoneId: string;

    // Scheduled order
    scheduledDate?: string;
    scheduledSlotId?: string;

    // Items
    items: {
      productId: string;
      quantity: number;
    }[];
  }

  export interface UpdateOrderStatusDto {
    status: OrderStatus;
  }

  export interface AssignDeliveryPersonDto {
    deliveryPersonId: string;
  }

  export interface CancelOrderDto {
    reason: string;
  }