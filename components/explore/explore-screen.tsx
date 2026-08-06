"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, SearchX, X } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import {
  SearchProductCard,
  SearchStoreHeader,
  SearchViewAllCard,
} from "@/components/shared/cards/search-cards";
import {
  VariantSelectorSheet,
  type VariantSheetTarget,
} from "@/components/shared/variant-selector-sheet";
import { FilterChip } from "@/components/ui/filter-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { focusRing } from "@/components/ui/pressable";
import type { SearchResultItem } from "@/lib/api/schemas/product";
import type { CategoriesGroup } from "@/lib/api/schemas/catalog";
import { useGetCategories } from "@/lib/api/services/catalog";
import { useGlobalSearch } from "@/lib/api/services/search";
import { splitRailProducts } from "@/lib/search-rail";
import { storeImageUrl } from "@/lib/store-image";
import { STRINGS } from "@/lib/strings";
import { deliveryFeeLabel, formatCedis, toTitleCase } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 300;

/** One store's product rail: up to five products, then a View-all tile. */
function RailProducts({
  result,
  onProductClick,
  onStoreClick,
}: {
  result: SearchResultItem;
  onProductClick: (productId: string, storeId: string) => void;
  onStoreClick: (storeId: string) => void;
}) {
  const { visible, hasMore } = splitRailProducts(result.products);
  if (visible.length === 0) return null;

  return (
    <div className="scrollbar-none flex gap-3 overflow-x-auto px-4 md:grid md:grid-cols-4 md:overflow-visible md:px-0 lg:grid-cols-6">
      {visible.map((product) => (
        <SearchProductCard
          key={product.id}
          name={product.name}
          imageUrl={product.images[0]?.url}
          minPrice={formatCedis(product.min_price)}
          onClick={() => onProductClick(product.id, result.company.id)}
        />
      ))}
      {hasMore ? (
        <SearchViewAllCard
          storeName={result.company.name}
          onClick={() => onStoreClick(result.company.id)}
        />
      ) : null}
    </div>
  );
}

/** Loader mirroring the store-header + product-row shape of a real result. */
function SearchResultsSkeleton() {
  return (
    <div className="mt-2 flex flex-col gap-6">
      {[0, 1].map((row) => (
        <div key={row} className="flex flex-col gap-3">
          <div className="flex min-h-12 items-center gap-3 px-4 md:px-0">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
          <div className="flex gap-3 px-4 md:px-0">
            {[0, 1, 2].map((card) => (
              <div key={card} className="flex w-[38vw] flex-col gap-2 md:w-full">
                <Skeleton className="h-[110px] w-full rounded-image" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-2/5" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ExploreScreen({
  /** Category chips prerendered on the server. */
  initialCategories,
}: {
  initialCategories?: CategoriesGroup[] | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = React.useState(initialQuery);
  const [activeQuery, setActiveQuery] = React.useState(initialQuery.trim());
  const [variantTarget, setVariantTarget] =
    React.useState<VariantSheetTarget>(null);

  // Debounced so a keystroke doesn't fire a request, but Enter and a trending
  // chip apply immediately.
  React.useEffect(() => {
    const timer = setTimeout(
      () => setActiveQuery(query.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [query]);

  const { data: categories } = useGetCategories(initialCategories);
  const allCategories = categories ?? [];
  const hasMultipleCategories = allCategories.length > 1;

  const search = useGlobalSearch(activeQuery);
  const results = search.data?.items ?? [];
  const total = search.data?.total ?? 0;

  const isSearchActive = activeQuery.length > 0;
  const showSkeleton = isSearchActive && search.isLoading;
  const showError = isSearchActive && search.isError;
  const showEmpty =
    isSearchActive && !showSkeleton && !showError && results.length === 0;

  const clearQuery = () => {
    setQuery("");
    setActiveQuery("");
  };

  const openStore = (storeId: string) => router.push(`/shops/${storeId}`);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-3 bg-background px-4 pt-3 pt-safe pb-3 md:mx-auto md:w-full md:max-w-[1280px] md:px-8 md:pt-6">
        <Text variant="h1" className="md:hidden">
          {STRINGS.explore.title}
        </Text>
        <div className="flex min-h-12 items-center gap-3 rounded-full border border-input bg-card px-4 md:hidden">
          <Search size={16} className="text-muted-foreground" aria-hidden />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") setActiveQuery(query.trim());
            }}
            placeholder={STRINGS.explore.searchPlaceholder}
            aria-label={STRINGS.explore.searchLabel}
            type="search"
            enterKeyHint="search"
            autoCapitalize="none"
            autoCorrect="off"
            className="flex-1 bg-transparent font-sans text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
          {query.length > 0 ? (
            <button
              type="button"
              onClick={clearQuery}
              aria-label={STRINGS.common.close}
              className={`flex size-8 items-center justify-center rounded-full text-muted-foreground active:opacity-60 ${focusRing}`}
            >
              <X size={16} aria-hidden />
            </button>
          ) : null}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1280px] flex-1 pb-10 md:px-8">
        {isSearchActive ? (
          showSkeleton ? (
            <SearchResultsSkeleton />
          ) : showError ? (
            <ErrorState error={search.error} onRetry={() => search.refetch()} />
          ) : showEmpty ? (
            <EmptyState
              icon={SearchX}
              title={STRINGS.empty.search.title}
              action={{
                label: STRINGS.empty.search.action,
                onClick: clearQuery,
              }}
            />
          ) : (
            <>
              <div className="mt-2 mb-6 px-4 md:px-0">
                <Text variant="body-small">
                  {STRINGS.common.storesFor(total, activeQuery)}
                </Text>
              </div>
              <ul className="flex flex-col gap-6">
                {results.map((result) => (
                  <li key={result.company.id} className="flex flex-col gap-3">
                    <SearchStoreHeader
                      name={result.company.name}
                      imageUrl={storeImageUrl(result.company)}
                      deliveryFee={deliveryFeeLabel({
                        resolved: result.company.delivery_fee,
                        min: result.company.min_delivery_fee,
                      })}
                      rating={result.company.rating}
                      onClick={() => openStore(result.company.id)}
                    />
                    <RailProducts
                      result={result}
                      onProductClick={(productId, storeId) =>
                        setVariantTarget({ productId, storeId })
                      }
                      onStoreClick={openStore}
                    />
                  </li>
                ))}
              </ul>

              {search.hasNextPage ? (
                <div className="flex justify-center py-6">
                  <button
                    type="button"
                    onClick={() => search.fetchNextPage()}
                    disabled={search.isFetchingNextPage}
                    className={`flex min-h-12 items-center gap-2 rounded-full px-4 font-sans text-base font-bold text-primary ${focusRing}`}
                  >
                    {search.isFetchingNextPage ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : null}
                    {STRINGS.home.seeAll}
                  </button>
                </div>
              ) : null}
            </>
          )
        ) : (
          <div className="flex flex-col gap-6 pt-2">
            {hasMultipleCategories ? (
              <div className="flex flex-col gap-3">
                <div className="px-4 md:px-0">
                  <SectionHeader title={STRINGS.explore.categoriesTitle} />
                </div>
                <div className="scrollbar-none flex gap-2 overflow-x-auto px-4 md:flex-wrap md:px-0">
                  {allCategories.map((category) => (
                    <FilterChip
                      key={category.id}
                      label={toTitleCase(category.label)}
                      onClick={() => router.push(`/home?category=${category.id}`)}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-3">
              <div className="px-4 md:px-0">
                <SectionHeader title={STRINGS.explore.trendingTitle} />
              </div>
              <div className="flex flex-wrap gap-2 px-4 md:px-0">
                {STRINGS.explore.trendingTags.map((tag) => (
                  <FilterChip
                    key={tag}
                    label={tag}
                    onClick={() => {
                      setQuery(tag);
                      setActiveQuery(tag);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <VariantSelectorSheet
        target={variantTarget}
        onClose={() => setVariantTarget(null)}
      />
    </div>
  );
}
