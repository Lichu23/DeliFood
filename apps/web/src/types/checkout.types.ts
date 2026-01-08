  export interface CustomerInfo {
    name: string;
    phone: string;
    email?: string;
  }

  export interface DeliveryAddress {
    address: string;
    city: string;
    postalCode?: string;
    notes?: string;
    zoneId: string;
  }

  export interface DeliveryTime {
    type: 'IMMEDIATE' | 'SCHEDULED';
    scheduledDate?: string; // YYYY-MM-DD
    scheduledTimeSlot?: string; // time slot ID
  }

  export interface CheckoutData {
    customerInfo: CustomerInfo;
    deliveryAddress: DeliveryAddress;
    deliveryTime: DeliveryTime;
    paymentMethod: 'CASH' | 'TRANSFER';
  }

  export interface DeliveryZone {
    id: string;
    name: string;
    maxDistance: number;
    deliveryFee: number;
    minimumOrder: number;
  }

  export interface DeliverySlot {
    id: string;
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    maxOrdersPerHour: number;
    _count?: {
      orders: number;
    };
  }

  export interface AvailableSlot {
    slot: DeliverySlot;
    available: boolean;
    remainingCapacity: number;
  }