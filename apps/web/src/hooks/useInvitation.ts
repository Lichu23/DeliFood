"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { invitationsService } from "@/services/invitations.service";
import { useAuthStore } from "@/store/authStore";
import { AcceptInvitationInput } from "@/schemas/invitations.schema";

export function useInvitation(token: string) {
  const router = useRouter();
  const { setAuth, user } = useAuthStore();

  // Fetch invitation details
  const {
    data: invitation,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["invitation", token],
    queryFn: () => invitationsService.getByToken(token),
    retry: false,
  });

  // Accept invitation (new user)
  const acceptNewMutation = useMutation({
    mutationFn: (data: AcceptInvitationInput) =>
      invitationsService.acceptNew(data),
    onSuccess: (response) => {
      setAuth(
        {
          ...response.user,
          phone: null, // Add the missing phone property
        },
        [
          {
            id: response.store.id,
            name: response.store.name,
            slug: response.store.slug,
            currency: "EUR", // Will be fetched from store details later
            role: response.role as "OWNER" | "ADMIN" | "CASHIER" | "DELIVERY",
            isActive: true,
          },
        ],
        response.token
      );
      router.push("/orders");
    },
  });

  // Accept invitation (existing user)
  const acceptExistingMutation = useMutation({
    mutationFn: () => invitationsService.acceptExisting(token),
    onSuccess: () => {
      // Refresh user data to get new store
      router.push("/orders");
    },
  });

  return {
    invitation,
    isLoading,
    error,
    acceptNew: acceptNewMutation.mutate,
    acceptExisting: acceptExistingMutation.mutate,
    isAccepting:
      acceptNewMutation.isPending || acceptExistingMutation.isPending,
    acceptError: acceptNewMutation.error || acceptExistingMutation.error,
  };
}
