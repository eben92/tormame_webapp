"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import { BranchSchema, type Branch } from "@/lib/api/schemas/catalog";

const ONE_HOUR = 1000 * 60 * 60;

/**
 * A store's active branches, oldest first. Public endpoint — works for guests.
 * Disabled until a company id is known, since checkout mounts before the cart's
 * store id is guaranteed to be present.
 */
export function useGetBranches(companyId: string | null | undefined) {
  return useQuery({
    queryKey: ["branches", companyId],
    queryFn: () =>
      apiFetch(`/shops/${companyId}/branches`, {
        schema: z.array(BranchSchema).nullish(),
      }),
    select: (data): Branch[] => data ?? [],
    enabled: Boolean(companyId),
    staleTime: ONE_HOUR,
  });
}
