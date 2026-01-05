import api from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";
import { AcceptInvitationInput } from "@/schemas/invitations.schema";
import {
  InvitationDetails,
  AcceptInvitationResponse,
  AcceptExistingResponse,
} from "@/types/invitation.types";

export const invitationsService = {
  async getByToken(token: string): Promise<InvitationDetails> {
    const response = await api.get<ApiResponse<InvitationDetails>>(
      `/invitations/${token}`
    );
    return response.data.data;
  },

  async acceptNew(
    data: AcceptInvitationInput
  ): Promise<AcceptInvitationResponse> {
    const response = await api.post<ApiResponse<AcceptInvitationResponse>>(
      "/invitations/accept",
      data
    );
    return response.data.data;
  },

  async acceptExisting(token: string): Promise<AcceptExistingResponse> {
    const response = await api.post<ApiResponse<AcceptExistingResponse>>(
      "/invitations/accept-existing",
      { token }
    );
    return response.data.data;
  },
};
