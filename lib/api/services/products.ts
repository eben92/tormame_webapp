"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import { paginated } from "@/lib/api/schemas/common";
import {
  MenuSectionSchema,
  ProductDetailSchema,
  ProductSchema,
  type MenuSection,
  type Product,
} from "@/lib/api/schemas/product";

const ProductPageSchema = paginated(ProductSchema);

type GetProductsParams = {
  companyId: string;
  categoryId?: string;
  search?: string;
  limit?: number;
};

export function useGetProducts(params: GetProductsParams) {
  return useInfiniteQuery({
    queryKey: ["products", params],
    initialPageParam: 0,
    enabled: Boolean(params.companyId),
    queryFn: ({ pageParam }) => {
      const limit = params.limit ?? 20;
      const searchParams = new URLSearchParams({
        company_id: params.companyId,
        limit: String(limit),
        offset: String(pageParam * limit),
      });
      if (params.categoryId) searchParams.append("category_id", params.categoryId);
      if (params.search) searchParams.append("search", params.search);

      return apiFetch(`/products?${searchParams.toString()}`, {
        schema: ProductPageSchema,
      });
    },
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPageParam + 1 < (lastPage.meta.total_pages ?? 1)
        ? lastPageParam + 1
        : undefined,
    select: (data): Product[] => data.pages.flatMap((page) => page.data),
  });
}

export function useGetProductDetail(productId: string | null) {
  return useQuery({
    queryKey: ["product-detail", productId],
    queryFn: () =>
      apiFetch(`/products/${productId}`, { schema: ProductDetailSchema }),
    enabled: Boolean(productId),
  });
}

/**
 * The whole store menu in one call — sections already grouped and ordered by the
 * server. Unpaginated by design: the store page needs the full section list to
 * drive its sticky category bar.
 */
export function useGetCompanyMenu(
  companyId: string,
  /** Menu prerendered on the server, so the store page paints with its items. */
  initialMenu?: MenuSection[] | null,
) {
  return useQuery({
    queryKey: ["company-menu", companyId],
    queryFn: () =>
      apiFetch(`/companies/${companyId}/menu`, {
        schema: z.array(MenuSectionSchema).nullish(),
      }),
    select: (data): MenuSection[] => data ?? [],
    initialData: initialMenu ?? undefined,
    initialDataUpdatedAt: initialMenu ? 0 : undefined,
    enabled: Boolean(companyId),
  });
}
