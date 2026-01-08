import axios from "@/lib/axios";
import { PublicStore, PublicStoreResponse } from "@/types/store.types";

export const publicStoreService = {
  /**
   * Get public store by slug (no auth required)
   */
  async getBySlug(slug: string): Promise<PublicStore> {
    // Create axios instance without auth interceptor for public routes
    const publicAxios = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
    });

    const response = await publicAxios.get<PublicStoreResponse>(
      `/stores/${slug}/public`
    );
    return response.data.data;
  },
};
