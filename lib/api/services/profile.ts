"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import {
  AccountDeletionRequestSchema,
  ChangePasswordResponseSchema,
  ProfileSchema,
} from "@/lib/api/schemas/account";
import { EmptySchema } from "@/lib/api/schemas/common";
import { useUserStore } from "@/stores/user";

const DELETION_REQUEST_KEY = ["account-deletion-request"];

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (input: { full_name: string }) =>
      apiFetch("/me", { method: "PUT", body: input, schema: ProfileSchema }),
    onSuccess: (profile) => {
      const current = useUserStore.getState().user;
      if (!current || !profile.full_name) return;
      useUserStore.setState({
        user: {
          ...current,
          profile: { ...current.profile, name: profile.full_name },
        },
      });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: {
      current_password: string;
      new_password: string;
    }) =>
      apiFetch("/me/change-password", {
        method: "POST",
        body: input,
        schema: ChangePasswordResponseSchema,
      }),
  });
}

/** The pending deletion request, or null when nothing is scheduled. */
export function useAccountDeletionRequest(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: DELETION_REQUEST_KEY,
    queryFn: () =>
      apiFetch("/me/deletion-request", {
        schema: AccountDeletionRequestSchema.nullish(),
      }),
    select: (data) => data ?? null,
    enabled: options?.enabled ?? true,
    // Deletion is a decision, not a feed: always show what the server holds
    // rather than a cached answer from before the customer acted.
    staleTime: 0,
  });
}

export function useRequestAccountDeletion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { reason?: string }) =>
      apiFetch("/me/deletion-request", {
        method: "POST",
        body: input,
        schema: AccountDeletionRequestSchema,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DELETION_REQUEST_KEY });
    },
  });
}

export function useCancelAccountDeletion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch("/me/deletion-request", {
        method: "DELETE",
        schema: EmptySchema,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DELETION_REQUEST_KEY });
    },
  });
}
