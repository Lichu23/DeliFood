import api from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";
import { LoginResponse, RegisterResponse, User } from "@/types/auth.types";
import { LoginInput, RegisterInput } from "@/schemas/auth.schema";

export const authService = {
  async login(data: LoginInput): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      data
    );
    return response.data.data;
  },

  async register(data: RegisterInput): Promise<RegisterResponse> {
    const response = await api.post<ApiResponse<RegisterResponse>>(
      "/auth/register",
      data
    );
    return response.data.data;
  },

  async getProfile() {
    const response = await api.get("/auth/profile");
    return response.data.data;
  },
  async updateProfile(data: { name: string; email: string; phone?: string }) {
    const response = await api.patch<ApiResponse<User>>("/auth/profile", data);
    return response.data.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const response = await api.post<ApiResponse<{ message: string }>>(
      "/auth/change-password",
      data
    );
    return response.data.data;
  },
};
