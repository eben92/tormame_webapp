"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, Store } from "lucide-react";
import { AddressButton } from "@/components/shell/address-button";
import { CategoryChipRail } from "@/components/shared/category-chip-rail";
import { SectionHeader } from "@/components/shared/section-header";
import { StoreCard } from "@/components/shared/cards/store-card";
import {
  TrendingCard,
  TrendingCardSkeleton,
} from "@/components/shared/cards/trending-card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { focusRing } from "@/components/ui/pressable";
import {
  EmptyState,
  ErrorState,
  SkeletonCard,
  SkeletonHero,
} from "@/components/ui/states";
import { useGetCategories } from "@/lib/api/services/catalog";
import {
  COMPANIES_PAGE_SIZE,
  useGetCompanies,
} from "@/lib/api/services/companies";
import type {
  CategoriesGroup,
  Company,
  CompanyPage,
} from "@/lib/api/schemas/catalog";
import { STRINGS } from "@/lib/strings";
import { storeImageUrl } from "@/lib/store-image";
import { deliveryFeeLabel, toTitleCase } from "@/lib/utils";

function companyToCard(company: Company) {
  return {
    id: company.id,
    name: company.name,
    category: typeof company.category === "string" ? company.category : undefined,
    rating: company.rating,
    deliveryTime: company.delivery_time,
    deliveryFee: deliveryFeeLabel({
      resolved: company.delivery_fee,
      min: company.min_delivery_fee,
    }),
    isFeatured: company.is_featured,
    promoPercent: company.promo_percent,
    imageUrl: storeImageUrl(company),
  };
}

/**
 * Compact inline error shown in place of a single rail when only that rail's
 * query failed — the section title stays, with a scoped retry, instead of a
 * full-screen error over content that loaded fine.
 */
function RailErrorRow({
  onRetry,
  isFetching,
}: {
  onRetry: () => void;
  isFetching: boolean;
}) {
  return (
    <div className="mx-4 flex min-h-12 items-center justify-between gap-3 rounded-card border border-border bg-card px-4 py-3">
      <Text variant="body-small" className="flex-1 text-muted-foreground">
        {STRINGS.home.railLoadErrorMessage}
      </Text>
      <button
        type="button"
        onClick={onRetry}
        disabled={isFetching}
        className={`flex h-12 min-w-12 items-center justify-center px-3 font-sans text-base font-bold text-primary active:opacity-60 ${focusRing}`}
      >
        {isFetching ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          STRINGS.common.retry
        )}
      </button>
    </div>
  );
}

/** Single marketing hero — one dominant CTA, never a competing carousel. */
function HomePromoSection({ onClick }: { onClick: () => void }) {
  return (
    <div className="px-4">
      <button
        type="button"
        onClick={onClick}
        aria-label={STRINGS.home.promoCta}
        className={`flex min-h-[150px] w-full flex-col justify-end gap-2 overflow-hidden rounded-card bg-linear-to-br from-primary to-primary-pressed p-6 text-left ${focusRing}`}
      >
        <Text as="span" variant="display" className="text-white">
          {STRINGS.home.promoTitle}
        </Text>
        <Text as="span" variant="body" className="text-white/90">
          {STRINGS.home.promoSubtitle}
        </Text>
        <span className="mt-2 flex min-h-12 items-center self-start rounded-full bg-white/20 px-4 font-sans text-base font-bold text-white">
          {STRINGS.home.promoCta}
        </span>
      </button>
    </div>
  );
}

type HomeScreenProps = {
  /** Prerendered on the server so the first paint carries real content. */
  initialCategories?: CategoriesGroup[] | null;
  initialPopular?: CompanyPage | null;
  initialTrending?: CompanyPage | null;
};

export function HomeScreen({
  initialCategories,
  initialPopular,
  initialTrending,
}: HomeScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? undefined;
  const isCategoryActive = Boolean(category);

  const {
    data: categories,
    isLoading: isCategoriesLoading,
    refetch: refetchCategories,
  } = useGetCategories(initialCategories);

  // The category view uses one vertical-scoped query; the default view uses two
  // server-sorted queries whose first page is shared with the See-all screens.
  const categoryQuery = useGetCompanies(
    category ? { category_vertical: category.toUpperCase(), limit: 20 } : undefined,
    { enabled: isCategoryActive },
  );
  const popularQuery = useGetCompanies(
    { sort: "popular", limit: COMPANIES_PAGE_SIZE },
    { enabled: !isCategoryActive, initialPage: initialPopular },
  );
  const trendingQuery = useGetCompanies(
    { sort: "trending", limit: COMPANIES_PAGE_SIZE },
    { enabled: !isCategoryActive, initialPage: initialTrending },
  );

  const stores = categoryQuery.data ?? [];
  const featuredStores = (popularQuery.data ?? []).slice(0, 4);
  const trendingStores = (trendingQuery.data ?? []).slice(0, 4);

  const setCategory = (next?: string) => {
    router.replace(next ? `/home?category=${next}` : "/home", { scroll: false });
  };

  const handleChipClick = (categoryId: string) =>
    setCategory(categoryId === category ? undefined : categoryId);

  const handleRefresh = () => {
    void refetchCategories();
    if (isCategoryActive) void categoryQuery.refetch();
    else {
      void popularQuery.refetch();
      void trendingQuery.refetch();
    }
  };

  const categoryLabel = category
    ? toTitleCase(
        categories?.find((item) => item.id === category)?.label ?? category,
      )
    : "";

  const categoryIsLoading = isCategoriesLoading || categoryQuery.isLoading;
  const homeIsLoading =
    isCategoriesLoading || popularQuery.isLoading || trendingQuery.isLoading;
  const homeIsError = popularQuery.isError && trendingQuery.isError;
  const homeIsEmpty =
    !homeIsLoading &&
    !homeIsError &&
    !popularQuery.isError &&
    !trendingQuery.isError &&
    featuredStores.length === 0 &&
    trendingStores.length === 0;

  return (
    <div className="flex flex-1 flex-col">
      <Text as="h1" variant="h1" className="sr-only">
        {STRINGS.home.pageHeading}
      </Text>

      <div className="flex flex-col gap-3 bg-background pb-3 md:hidden">
        <AddressButton />

        <Link
          href="/explore"
          aria-label={STRINGS.home.searchLabel}
          className={`mx-4 flex min-h-12 items-center gap-3 rounded-full border border-input bg-card px-4 ${focusRing}`}
        >
          <Search size={16} className="text-muted-foreground" aria-hidden />
          <Text as="span" variant="body" className="flex-1 text-muted-foreground">
            {STRINGS.home.searchPlaceholder}
          </Text>
        </Link>

        <CategoryChipRail
          categories={categories ?? []}
          activeCategoryId={category}
          isLoading={isCategoriesLoading}
          onSelectAll={() => setCategory(undefined)}
          onSelectCategory={handleChipClick}
        />
      </div>

      <div className="hidden px-8 pt-6 pb-2 md:block">
        <div className="mx-auto w-full max-w-[1280px]">
          <CategoryChipRail
            categories={categories ?? []}
            activeCategoryId={category}
            isLoading={isCategoriesLoading}
            onSelectAll={() => setCategory(undefined)}
            onSelectCategory={handleChipClick}
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1280px] flex-1 md:px-8">
        {isCategoryActive ? (
          <section className="flex flex-1 flex-col pb-8">
            {categoryIsLoading ? (
              <div className="flex flex-col gap-3 px-4 pt-2 md:grid md:grid-cols-2 md:px-0 lg:grid-cols-3">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : categoryQuery.isError ? (
              <ErrorState
                error={categoryQuery.error}
                onRetry={() => categoryQuery.refetch()}
              />
            ) : stores.length === 0 ? (
              <EmptyState
                icon={Store}
                title={STRINGS.empty.categoryStores(categoryLabel).title}
                action={{
                  label: STRINGS.empty.categoryStores(categoryLabel).action,
                  onClick: () => setCategory(undefined),
                }}
              />
            ) : (
              <>
                <div className="px-4 pb-4 md:px-0">
                  <SectionHeader
                    title={categoryLabel}
                    subtitle={STRINGS.category.placesNearYou(stores.length)}
                  />
                </div>
                <ul className="flex flex-col gap-3 px-4 md:grid md:grid-cols-2 md:px-0 lg:grid-cols-3">
                  {stores.map((store) => (
                    <li key={store.id}>
                      <StoreCard
                        {...companyToCard(store)}
                        variant="landscape"
                        href={`/shops/${store.id}`}
                      />
                    </li>
                  ))}
                </ul>
                {categoryQuery.hasNextPage ? (
                  <div className="mt-6 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => categoryQuery.fetchNextPage()}
                      isLoading={categoryQuery.isFetchingNextPage}
                    >
                      {STRINGS.home.seeAll}
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </section>
        ) : (
          <section className="flex flex-1 flex-col pb-6">
            {homeIsLoading ? (
              <div className="flex flex-col gap-6 pt-2">
                <div className="flex flex-col gap-6 px-4 md:px-0">
                  <SkeletonHero />
                  <div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-4">
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                </div>
                <div className="flex gap-3 px-4 md:px-0">
                  <TrendingCardSkeleton />
                  <TrendingCardSkeleton />
                </div>
              </div>
            ) : homeIsError ? (
              <ErrorState
                error={popularQuery.error ?? trendingQuery.error}
                onRetry={handleRefresh}
              />
            ) : homeIsEmpty ? (
              <EmptyState
                icon={Store}
                title={STRINGS.empty.homeStores.title}
                action={{
                  label: STRINGS.empty.homeStores.action,
                  onClick: () => router.push("/explore"),
                }}
              />
            ) : (
              <>
                <div className="mt-3 md:mt-6 md:px-0">
                  <HomePromoSection onClick={() => router.push("/explore")} />
                </div>

                {featuredStores.length > 0 || popularQuery.isError ? (
                  <div className="mt-6 flex flex-col gap-3">
                    <div className="px-4 md:px-0">
                      <SectionHeader
                        title={STRINGS.home.popularTitle}
                        subtitle={STRINGS.home.popularSubtitle}
                        seeAllHref="/collection/popular"
                      />
                    </div>
                    {popularQuery.isError ? (
                      <RailErrorRow
                        onRetry={() => popularQuery.refetch()}
                        isFetching={popularQuery.isFetching}
                      />
                    ) : (
                      <ul className="scrollbar-none flex gap-3 overflow-x-auto px-4 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4">
                        {featuredStores.map((store, index) => (
                          <li key={store.id} className="md:w-full">
                            <StoreCard
                              {...companyToCard(store)}
                              priority={index === 0}
                              href={`/shops/${store.id}`}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : null}

                {trendingStores.length > 0 || trendingQuery.isError ? (
                  <div className="mt-6 flex flex-col gap-3">
                    <div className="px-4 md:px-0">
                      <SectionHeader
                        title={STRINGS.home.trendingTitle}
                        subtitle={STRINGS.home.trendingSubtitle}
                        seeAllHref="/collection/trending"
                      />
                    </div>
                    {trendingQuery.isError ? (
                      <RailErrorRow
                        onRetry={() => trendingQuery.refetch()}
                        isFetching={trendingQuery.isFetching}
                      />
                    ) : (
                      <ul className="scrollbar-none flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4">
                        {trendingStores.map((store) => (
                          <li key={store.id} className="md:w-full">
                            <TrendingCard
                              {...companyToCard(store)}
                              href={`/shops/${store.id}`}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : null}
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
