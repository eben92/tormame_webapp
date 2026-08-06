"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import {
  CompanyPageSchema,
  CompanySchema,
  type Company,
  type CompanyPage,
} from "@/lib/api/schemas/catalog";
import { COMPANIES_PAGE_SIZE } from "@/lib/api/constants";
import { useOnboardingStore } from "@/stores/onboarding";

export { COMPANIES_PAGE_SIZE };

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
  options?: {
    enabled?: boolean;
    /**
     * First page rendered on the server. It is city-agnostic (the server can't
     * read the customer's city), so it is marked stale on arrival: the list
     * paints instantly and the city-resolved delivery fees arrive with the
     * background refetch.
     */
    initialPage?: CompanyPage | null;
  },
) {
  const city = useOnboardingStore((state) => state.city);
  const initialPage = options?.initialPage;

  return useInfiniteQuery({
    queryKey: ["companies", params ?? null, city],
    initialPageParam: 0,
    enabled: options?.enabled ?? true,
    staleTime: 60_000,
    initialData: initialPage
      ? { pages: [initialPage], pageParams: [0] }
      : undefined,
    initialDataUpdatedAt: initialPage ? 0 : undefined,
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
  /** Store prerendered on the server; the city-resolved copy replaces it. */
  initialCompany?: Company | null,
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
    initialData: initialCompany ?? undefined,
    initialDataUpdatedAt: initialCompany ? 0 : undefined,
    enabled: Boolean(companyId),
  });
}
