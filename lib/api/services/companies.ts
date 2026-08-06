"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { CompanySchema, type Company } from "@/lib/api/schemas/catalog";
import { paginated } from "@/lib/api/schemas/common";
import { useOnboardingStore } from "@/stores/onboarding";

export const COMPANIES_PAGE_SIZE = 20;

const CompanyPageSchema = paginated(CompanySchema);

type CompanyParams = {
  limit?: number;
  search?: string;
  category_vertical?: string;
  sort?: "popular" | "trending";
};

/**
 * Store list, scoped to the customer's city. `staleTime` avoids a background
 * refetch (and its phantom refresh spinner) when a screen mounts on a list that
 * another screen just loaded — e.g. See-all right after Home.
 */
export function useGetCompanies(
  params?: CompanyParams,
  options?: { enabled?: boolean },
) {
  const city = useOnboardingStore((state) => state.city);

  return useInfiniteQuery({
    queryKey: ["companies", params ?? null, city],
    initialPageParam: 0,
    enabled: options?.enabled ?? true,
    staleTime: 60_000,
    queryFn: ({ pageParam }) => {
      const limit = params?.limit ?? COMPANIES_PAGE_SIZE;
      const searchParams = new URLSearchParams();
      Object.entries(params ?? {}).forEach(([key, value]) => {
        if (key !== "limit" && value) searchParams.append(key, String(value));
      });
      if (city) searchParams.append("city", city);
      searchParams.append("limit", String(limit));
      searchParams.append("offset", String(pageParam * limit));

      return apiFetch(`/companies?${searchParams.toString()}`, {
        schema: CompanyPageSchema,
      });
    },
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPageParam + 1 < (lastPage.meta.total_pages ?? 1)
        ? lastPageParam + 1
        : undefined,
    select: (data): Company[] => data.pages.flatMap((page) => page.data),
  });
}

/** A single store, as shown to customers (public endpoint — works for guests). */
export function useGetPublicCompany(
  companyId: string,
  cityOverride?: string | null,
) {
  const onboardingCity = useOnboardingStore((state) => state.city);
  const city = cityOverride !== undefined ? cityOverride : onboardingCity;

  return useQuery({
    queryKey: ["shops", companyId, city],
    queryFn: () =>
      apiFetch(
        `/shops/${companyId}${city ? `?city=${encodeURIComponent(city)}` : ""}`,
        { schema: CompanySchema },
      ),
    enabled: Boolean(companyId),
  });
}
