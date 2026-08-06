"use client";

import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import {
  ChangePasswordResponseSchema,
  ProfileSchema,
} from "@/lib/api/schemas/account";
import { useUserStore } from "@/stores/user";

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
