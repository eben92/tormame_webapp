"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { paginated } from "@/lib/api/schemas/common";
import {
  SearchResultItemSchema,
  type SearchResultItem,
} from "@/lib/api/schemas/product";
import { useOnboardingStore } from "@/stores/onboarding";

const SEARCH_PAGE_LIMIT = 20;

const SearchPageSchema = paginated(SearchResultItemSchema);

export function useGlobalSearch(query: string) {
  const trimmed = query.trim();
  const city = useOnboardingStore((state) => state.city);

  return useInfiniteQuery({
    queryKey: ["search", trimmed, city],
    initialPageParam: 0,
    enabled: trimmed.length > 0,
    queryFn: ({ pageParam }) => {
      const searchParams = new URLSearchParams();
      searchParams.append("search", trimmed);
      if (city) searchParams.append("city", city);
      searchParams.append("limit", String(SEARCH_PAGE_LIMIT));
      searchParams.append("offset", String(pageParam * SEARCH_PAGE_LIMIT));

      return apiFetch(`/search?${searchParams.toString()}`, {
        schema: SearchPageSchema,
      });
    },
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPageParam + 1 < (lastPage.meta.total_pages ?? 1)
        ? lastPageParam + 1
        : undefined,
    select: (
      data,
    ): { items: SearchResultItem[]; total: number } => {
      const items = data.pages.flatMap((page) => page.data);
      // The true match count lives on the wire (`meta.total_records`), not in the
      // number of pages loaded so far — a flattened length would undercount and
      // change with every page fetched.
      const lastPage = data.pages[data.pages.length - 1];
      return { items, total: lastPage?.meta.total_records ?? items.length };
    },
  });
}
