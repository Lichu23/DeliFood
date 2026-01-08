  import axios from "axios";
  import {
    CreatePublicOrderData,
    PublicOrderResponse
  } from "@/types/store.types";
  import { AvailableSlot } from "@/types/checkout.types";
  import { PublicOrderDetail, PublicOrderDetailResponse } from "@/types/order.types";

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  export const publicOrdersService = {
    /**
     * Create a new order (public - no auth required)
     */
    async create(slug: string, data: CreatePublicOrderData): Promise<PublicOrderResponse['data']> {
      const response = await axios.post<PublicOrderResponse>(
        `${API_URL}/stores/${slug}/orders`,
        data
      );
      return response.data.data;
    },

    /**
     * Get available delivery slots for a specific date
     */
    async getAvailableSlots(slug: string, date: string): Promise<AvailableSlot[]> {
      const response = await axios.get<{ success: boolean; data: AvailableSlot[] }>(
        `${API_URL}/stores/${slug}/delivery-slots/available`,
        { params: { date } }
      );
      return response.data.data;
    },

    /**
     * Get order details by ID (public)
     */
    async getOrderById(orderId: string): Promise<PublicOrderDetail> {
      const response = await axios.get<PublicOrderDetailResponse>(
        `${API_URL}/orders/${orderId}/track`
      );
      return response.data.data;
    },

    /**
     * Track order by ID (public) - alias for getOrderById
     */
    async trackOrder(orderId: string): Promise<PublicOrderDetail> {
      return this.getOrderById(orderId);
    },
  };