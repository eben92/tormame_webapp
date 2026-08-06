"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import {
  CategoriesGroupSchema,
  CitySchema,
  type CategoriesGroup,
  type City,
} from "@/lib/api/schemas/catalog";
import { getCategoryIcon } from "@/lib/category-icons";

const ONE_DAY = 1000 * 60 * 60 * 24;

/**
 * Backend city directory. No bundled fallback: on failure the query retries in the
 * background (capped exponential backoff) and refetches on reconnect, so a cold
 * offline load eventually succeeds.
 */
export function useGetCities(initialCities?: City[] | null) {
  return useQuery({
    queryKey: ["cities"],
    queryFn: () =>
      apiFetch("/cities", { schema: z.array(CitySchema).nullish() }),
    select: (data): City[] => data ?? [],
    // Prerendered on the server for the screens that ask for it; the directory
    // is cached for a day on both sides, so this needs no immediate refetch.
    initialData: initialCities ?? undefined,
    staleTime: ONE_DAY,
    refetchOnReconnect: true,
    retry: true,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
  });
}

/** City names for the pickers and matchers. Empty array while loading. */
export function useCityNames(initialCities?: City[] | null): string[] {
  const { data } = useGetCities(initialCities);
  return useMemo(() => (data ?? []).map((city) => city.name), [data]);
}

export type CategoryChip = {
  id: string;
  label: string;
  slug: string;
  isPrimary: boolean;
  Icon: ReturnType<typeof getCategoryIcon>;
};

/**
 * Category verticals for the home rail, explore chips and lobby bubbles. The API
 * groups categories by vertical; the UI only ever shows the vertical itself.
 */
export function useGetCategories(initialGroups?: CategoriesGroup[] | null) {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      apiFetch("/categories/grouped", {
        schema: z.array(CategoriesGroupSchema).nullish(),
      }),
    // Server-rendered groups come through as the raw API shape, so `select`
    // below still owns the mapping to chips — a Lucide component can't cross
    // the server/client boundary. Marked stale on arrival so the client
    // revalidates in the background without ever showing a spinner.
    initialData: initialGroups ?? undefined,
    initialDataUpdatedAt: initialGroups ? 0 : undefined,
    select: (data): CategoryChip[] =>
      (data ?? []).map((group) => ({
        id: group.vertical.toLowerCase(),
        label: group.vertical,
        slug: group.vertical.toLowerCase(),
        isPrimary: ["FOOD", "GROCERIES", "GROCERY"].includes(group.vertical),
        Icon: getCategoryIcon(group.vertical),
      })),
  });
}
