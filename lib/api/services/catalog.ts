"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import {
  CategoriesGroupSchema,
  CitySchema,
  type City,
} from "@/lib/api/schemas/catalog";
import { getCategoryIcon } from "@/lib/category-icons";

const ONE_DAY = 1000 * 60 * 60 * 24;

/**
 * Backend city directory. No bundled fallback: on failure the query retries in the
 * background (capped exponential backoff) and refetches on reconnect, so a cold
 * offline load eventually succeeds.
 */
export function useGetCities() {
  return useQuery({
    queryKey: ["cities"],
    queryFn: () =>
      apiFetch("/cities", { schema: z.array(CitySchema).nullish() }),
    select: (data): City[] => data ?? [],
    staleTime: ONE_DAY,
    refetchOnReconnect: true,
    retry: true,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
  });
}

/** City names for the pickers and matchers. Empty array while loading. */
export function useCityNames(): string[] {
  const { data } = useGetCities();
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
export function useGetCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      apiFetch("/categories/grouped", {
        schema: z.array(CategoriesGroupSchema).nullish(),
      }),
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
