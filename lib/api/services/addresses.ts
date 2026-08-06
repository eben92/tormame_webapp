"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import {
  AddressSchema,
  type Address,
  type CreateAddressInput,
  type UpdateAddressInput,
} from "@/lib/api/schemas/account";
import { EmptySchema } from "@/lib/api/schemas/common";

export function useGetAddresses(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: () =>
      apiFetch("/me/addresses", { schema: z.array(AddressSchema).nullish() }),
    select: (data): Address[] => data ?? [],
    enabled: options?.enabled ?? true,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAddressInput) =>
      apiFetch("/me/addresses", {
        method: "POST",
        body: input,
        schema: AddressSchema,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & UpdateAddressInput) =>
      apiFetch(`/me/addresses/${id}`, {
        method: "PUT",
        body: input,
        schema: AddressSchema,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (addressId: string) =>
      apiFetch(`/me/addresses/${addressId}`, {
        method: "DELETE",
        schema: EmptySchema,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
}
