import axios from "@/lib/axios";
import type {
  Order,
  OrderStatus,
  OrdersListResponse,
  CreateOrderDto,
  UpdateOrderStatusDto,
  AssignDeliveryPersonDto,
  CancelOrderDto,
  OrderFilters,
} from "@/types/order.types";

// Backend response types
interface BackendOrderItem {
  id: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
  unitPrice: number;
  subtotal?: number;
}

interface BackendStatusHistory {
  id: string;
  orderId: string;
  status: string;
  changedBy?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface BackendOrder {
  id: string;
  orderNumber: number;
  storeId: string;
  status: string;
  type: string;
  paymentMethod: string;
  paymentStatus: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  customerAddress: string;
  customerPostalCode?: string;
  customerNotes?: string;
  deliveryZoneId?: string;
  deliveryZone?: {
    id: string;
    name: string;
    deliveryFee: number;
  };
  assignedToId?: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  estimatedDeliveryTime?: string;
  scheduledDate?: string;
  scheduledSlotId?: string;
  scheduledSlot?: {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  };
  subtotal: number;
  deliveryFee: number;
  total: number;
  items: BackendOrderItem[];
  statusHistory?: BackendStatusHistory[];
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancelReason?: string;
}

export const ordersService = {
async list(
    storeId: string,
    filters?: OrderFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<OrdersListResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        filters.status.forEach((s) => params.append('status', s));
      } else {
        params.append('status', filters.status);
      }
    }

    if (filters?.type) {
      params.append('type', filters.type);
    }

    if (filters?.paymentStatus) {
      params.append('paymentStatus', filters.paymentStatus);
    }

    if (filters?.deliveryPersonId) {
      params.append('deliveryPersonId', filters.deliveryPersonId);
    }

    if (filters?.dateFrom) {
      params.append('dateFrom', filters.dateFrom);
    }

    if (filters?.dateTo) {
      params.append('dateTo', filters.dateTo);
    }

    if (filters?.search) {
      params.append('search', filters.search);
    }

    const url = `/stores/${storeId}/orders?${params.toString()}`;

    try {
      const response = await axios.get<{ success: boolean; data: BackendOrder[] }>(url);

      const backendOrders = response.data.data || [];

      // Transform backend orders to frontend Order format
      const transformedOrders = backendOrders.map((orderData: BackendOrder) => ({
        id: orderData.id,
        orderNumber: orderData.orderNumber.toString(),
        storeId: orderData.storeId,
        status: orderData.status as OrderStatus,
        type: orderData.type as Order['type'],
        paymentMethod: orderData.paymentMethod as Order['paymentMethod'],
        paymentStatus: orderData.paymentStatus as Order['paymentStatus'],

        // Map backend field names to frontend field names
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail || '',
        customerPhone: orderData.customerPhone,
        deliveryAddress: orderData.customerAddress || '',
        deliveryCity: orderData.customerAddress?.split(',')[1]?.trim() || '',
        deliveryPostalCode: orderData.customerPostalCode,
        customerNotes: orderData.customerNotes,

        deliveryZoneId: orderData.deliveryZoneId || '',
        deliveryZone: orderData.deliveryZone,
        deliveryPersonId: orderData.assignedToId,
        deliveryPerson: orderData.assignedTo ? {
          id: orderData.assignedTo.id,
          name: orderData.assignedTo.name,
          email: orderData.assignedTo.email,
        } : undefined,
        estimatedDeliveryTime: orderData.estimatedDeliveryTime,

        scheduledDate: orderData.scheduledDate,
        scheduledSlotId: orderData.scheduledSlotId,
        scheduledSlot: orderData.scheduledSlot,

        subtotal: orderData.subtotal,
        deliveryFee: orderData.deliveryFee,
        total: orderData.total,

        items: (orderData.items || []).map((item: BackendOrderItem) => ({
          id: item.id,
          orderId: orderData.id,
          productId: item.productId,
          product: {
            id: item.product?.id || item.productId,
            name: item.product?.name || 'Producto',
            price: item.unitPrice || item.product?.price || 0,
            image: item.product?.image,
          },
          quantity: item.quantity,
          unitPrice: item.unitPrice || item.product?.price || 0,
          subtotal: item.subtotal || (item.quantity * (item.unitPrice || 0)),
        })),

        statusHistory: orderData.statusHistory?.map((history: BackendStatusHistory) => ({
          id: history.id,
          orderId: history.orderId,
          status: history.status as OrderStatus,
          changedBy: history.changedBy,
          createdAt: history.createdAt,
        })),

        createdAt: orderData.createdAt,
        updatedAt: orderData.updatedAt,
        cancelledAt: orderData.cancelledAt,
        cancellationReason: orderData.cancelReason,
      }));

      return {
        orders: transformedOrders,
        total: transformedOrders.length,
        page: page,
        limit: limit,
      };
    } catch (error) {
      console.error('❌ Orders API error:', error);
      throw error;
    }
  },
  async getById(storeId: string, orderId: string): Promise<Order> {
    const url = `/stores/${storeId}/orders/${orderId}`;

    try {
      const response = await axios.get<{
        success: boolean;
        data: BackendOrder;
      }>(url);

      const orderData = response.data.data;

      return {
        id: orderData.id,
        orderNumber: orderData.orderNumber.toString(),
        storeId: orderData.storeId,
        status: orderData.status as OrderStatus,
        type: orderData.type as Order["type"],
        paymentMethod: orderData.paymentMethod as Order["paymentMethod"],
        paymentStatus: orderData.paymentStatus as Order["paymentStatus"],

        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail || "",
        customerPhone: orderData.customerPhone,
        deliveryAddress: orderData.customerAddress,
        deliveryCity: orderData.customerAddress?.split(",")[1]?.trim() || "",
        deliveryPostalCode: orderData.customerPostalCode,
        customerNotes: orderData.customerNotes,

        deliveryZoneId: orderData.deliveryZoneId || "",
        deliveryZone: orderData.deliveryZone,
        deliveryPersonId: orderData.assignedToId,
        deliveryPerson: orderData.assignedTo
          ? {
              id: orderData.assignedTo.id,
              name: orderData.assignedTo.name,
              email: orderData.assignedTo.email,
            }
          : undefined,
        estimatedDeliveryTime: orderData.estimatedDeliveryTime,

        scheduledDate: orderData.scheduledDate,
        scheduledSlotId: orderData.scheduledSlotId,
        scheduledSlot: orderData.scheduledSlot,

        subtotal: orderData.subtotal,
        deliveryFee: orderData.deliveryFee,
        total: orderData.total,

        items: (orderData.items || []).map((item: BackendOrderItem) => ({
          id: item.id,
          orderId: orderData.id,
          productId: item.productId,
          product: {
            id: item.product?.id || item.productId,
            name: item.product?.name || "Producto",
            price: item.unitPrice || item.product?.price || 0,
            image: item.product?.image,
          },
          quantity: item.quantity,
          unitPrice: item.unitPrice || item.product?.price || 0,
          subtotal: item.subtotal || item.quantity * (item.unitPrice || 0),
        })),

        statusHistory: orderData.statusHistory?.map(
          (history: BackendStatusHistory) => ({
            id: history.id,
            orderId: history.orderId,
            status: history.status as OrderStatus,
            changedBy: history.changedBy,
            createdAt: history.createdAt,
          })
        ),

        createdAt: orderData.createdAt,
        updatedAt: orderData.updatedAt,
        cancelledAt: orderData.cancelledAt,
        cancellationReason: orderData.cancelReason,
      };
    } catch (error) {
      console.error("❌ Order API error:", error);
      throw error;
    }
  },

  async create(storeId: string, data: CreateOrderDto): Promise<Order> {
    const response = await axios.post(`/stores/${storeId}/orders`, data);
    return response.data.data;
  },

  async updateStatus(
    storeId: string,
    orderId: string,
    data: UpdateOrderStatusDto
  ): Promise<Order> {
    const response = await axios.patch(
      `/stores/${storeId}/orders/${orderId}/status`,
      data
    );
    return response.data.data;
  },

  async assignDeliveryPerson(
    storeId: string,
    orderId: string,
    data: AssignDeliveryPersonDto
  ): Promise<Order> {
    const response = await axios.post(
      `/stores/${storeId}/orders/${orderId}/assign`,
      data
    );
    return response.data.data;
  },

  async confirmPayment(storeId: string, orderId: string): Promise<Order> {
    const response = await axios.post(
      `/stores/${storeId}/orders/${orderId}/confirm-payment`
    );
    return response.data.data;
  },

  async cancel(
    storeId: string,
    orderId: string,
    data: CancelOrderDto
  ): Promise<Order> {
    // ✅ Fixed: Using POST instead of PATCH
    const response = await axios.post(
      `/stores/${storeId}/orders/${orderId}/cancel`,
      data
    );
    return response.data.data;
  },

  async getStats(storeId: string, dateFrom?: string, dateTo?: string) {
    const params = new URLSearchParams();
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) params.append("dateTo", dateTo);

    const response = await axios.get(
      `/stores/${storeId}/orders/stats?${params.toString()}`
    );
    return response.data.data;
  },
};
