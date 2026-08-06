"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { StoreCard } from "@/components/shared/cards/store-card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { EmptyState, ErrorState, SkeletonCard } from "@/components/ui/states";
import { focusRing, pressableScale } from "@/components/ui/pressable";
import type { Company, CompanyPage } from "@/lib/api/schemas/catalog";
import {
  COMPANIES_PAGE_SIZE,
  useGetCompanies,
} from "@/lib/api/services/companies";
import { collectionTitle, type CollectionSort } from "@/lib/collection";
import { storeImageUrl } from "@/lib/store-image";
import { STRINGS } from "@/lib/strings";
import { cn, deliveryFeeLabel } from "@/lib/utils";

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

/** See-all list for a home rail. Shares the rail's first page via the same query key. */
export function CollectionScreen({
  sort,
  initialPage,
}: {
  sort: CollectionSort;
  /** First page prerendered on the server; see app/(app)/collection/[sort]. */
  initialPage?: CompanyPage | null;
}) {
  const router = useRouter();
  const query = useGetCompanies(
    { sort, limit: COMPANIES_PAGE_SIZE },
    { initialPage },
  );
  const stores = query.data ?? [];

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-3 bg-background px-4 pt-3 pb-3 md:mx-auto md:w-full md:max-w-[1280px] md:px-8 md:pt-8">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label={STRINGS.common.back}
          className={cn(
            "flex size-12 items-center justify-center rounded-full bg-muted text-foreground",
            pressableScale,
            focusRing,
          )}
        >
          <ArrowLeft size={20} aria-hidden />
        </button>
        <Text as="h1" variant="h3">
          {collectionTitle(sort)}
        </Text>
      </div>

      <div className="mx-auto w-full max-w-[1280px] flex-1 px-4 pb-10 md:px-8">
        {query.isLoading ? (
          <div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : stores.length === 0 ? (
          <EmptyState
            art="stores"
            title={STRINGS.collection.emptyTitle}
            action={{
              label: STRINGS.common.browseStores,
              onClick: () => router.push("/home"),
            }}
          />
        ) : (
          <>
            <ul className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
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

            {query.isError ? (
              <Text variant="body-small" className="mt-4 text-center text-destructive">
                {STRINGS.collection.loadMoreErrorMessage}
              </Text>
            ) : null}

            {query.hasNextPage ? (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => query.fetchNextPage()}
                  isLoading={query.isFetchingNextPage}
                >
                  {STRINGS.home.seeAll}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
