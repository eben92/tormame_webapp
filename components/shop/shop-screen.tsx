"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Star, Truck, X } from "lucide-react";
import { ProductCard } from "@/components/shared/cards/product-card";
import {
  VariantSelectorSheet,
  type VariantSheetTarget,
} from "@/components/shared/variant-selector-sheet";
import { FilterChip } from "@/components/ui/filter-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { focusRing, pressableScale } from "@/components/ui/pressable";
import { useGetPublicCompany } from "@/lib/api/services/companies";
import {
  useGetCompanyMenu,
  useGetProducts,
} from "@/lib/api/services/products";
import { STRINGS } from "@/lib/strings";
import { storeImageUrl } from "@/lib/store-image";
import { cn, deliveryFeeLabel } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 300;

function ShopHeroSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-56 w-full rounded-none md:rounded-card" />
      <div className="flex flex-col gap-2 px-4 md:px-0">
        <Skeleton className="h-6 w-2/5" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

export function ShopScreen({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [searchVisible, setSearchVisible] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [activeCategoryId, setActiveCategoryId] = React.useState<string | null>(
    null,
  );
  const [variantTarget, setVariantTarget] =
    React.useState<VariantSheetTarget>(null);

  React.useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedQuery(searchQuery.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const company = useGetPublicCompany(companyId);
  const menu = useGetCompanyMenu(companyId);
  const isSearching = debouncedQuery.length > 0;

  // Only queried while a search is actually running — the whole menu already
  // arrived in one call above.
  const searchResults = useGetProducts({
    companyId: isSearching ? companyId : "",
    search: debouncedQuery,
    limit: 20,
  });

  // Memoised so the section observer below re-subscribes only when the menu
  // itself changes, not on every render.
  const sections = React.useMemo(() => menu.data ?? [], [menu.data]);
  const sectionRefs = React.useRef(new Map<string, HTMLElement>());

  // Highlights whichever section is currently under the sticky bar.
  React.useEffect(() => {
    if (isSearching || sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target instanceof HTMLElement) {
          setActiveCategoryId(visible.target.dataset.sectionId ?? null);
        }
      },
      { rootMargin: "-140px 0px -70% 0px", threshold: 0 },
    );
    sectionRefs.current.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [isSearching, sections]);

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current.get(sectionId);
    if (!element) return;
    const top = element.getBoundingClientRect().top + window.scrollY - 132;
    window.scrollTo({ top, behavior: "smooth" });
    setActiveCategoryId(sectionId);
  };

  const openProduct = (productId: string) =>
    setVariantTarget({ productId, storeId: companyId });

  if (company.isLoading || menu.isLoading) {
    return (
      <div className="flex flex-1 flex-col pt-safe">
        <ShopHeroSkeleton />
      </div>
    );
  }

  if (company.isError) {
    return (
      <ErrorState error={company.error} onRetry={() => company.refetch()} />
    );
  }

  if (!company.data) {
    return (
      <EmptyState
        icon={X}
        title={STRINGS.shop.notFoundTitle}
        action={{ label: STRINGS.common.back, onClick: () => router.back() }}
      />
    );
  }

  const store = company.data;
  const bannerUrl = storeImageUrl(store);
  const rating = store.rating;
  const fee = deliveryFeeLabel({
    resolved: store.delivery_fee,
    min: store.min_delivery_fee,
  });

  const visibleProducts = isSearching ? (searchResults.data ?? []) : [];

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative">
        <div className="relative h-56 w-full bg-muted md:h-72">
          <Image
            src={bannerUrl || "/auth.webp"}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-(--header-scrim-top) to-(--header-scrim-bottom)" />
        </div>

        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-3 pt-safe">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label={STRINGS.common.back}
            className={cn(
              "flex size-12 items-center justify-center rounded-full bg-(--overlay) text-white",
              pressableScale,
              focusRing,
            )}
          >
            <ArrowLeft size={20} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setSearchVisible((visible) => !visible)}
            aria-label={STRINGS.shop.searchToggleLabel}
            aria-pressed={searchVisible}
            className={cn(
              "flex size-12 items-center justify-center rounded-full bg-(--overlay) text-white",
              pressableScale,
              focusRing,
            )}
          >
            {searchVisible ? <X size={20} aria-hidden /> : <Search size={20} aria-hidden />}
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 px-4 pb-4 md:px-8">
          <Text variant="h1" className="text-white">
            {store.name}
          </Text>
          <div className="flex items-center gap-3">
            {rating != null && rating > 0 ? (
              <span className="flex items-center gap-1">
                <Star size={12} className="fill-accent text-accent" aria-hidden />
                <Text as="span" variant="body-small" className="text-white/90">
                  {rating}
                </Text>
              </span>
            ) : null}
            <span className="flex items-center gap-1">
              <Truck size={12} className="text-white/90" aria-hidden />
              <Text as="span" variant="body-small" className="text-white/90">
                {fee}
              </Text>
            </span>
          </div>
        </div>
      </div>

      {searchVisible ? (
        <div className="sticky top-0 z-30 bg-background px-4 py-3 md:top-[4.5rem] md:px-8">
          <div className="mx-auto flex min-h-12 w-full max-w-[1280px] items-center gap-3 rounded-full border border-input bg-card px-4">
            <Search size={16} className="text-muted-foreground" aria-hidden />
            <input
              autoFocus
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={STRINGS.shop.searchPlaceholder(store.name)}
              aria-label={STRINGS.shop.searchToggleLabel}
              type="search"
              className="flex-1 bg-transparent font-sans text-base text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      ) : null}

      {!isSearching && sections.length > 1 ? (
        <div className="sticky top-0 z-30 border-b border-border bg-background py-2 md:top-[4.5rem] md:hidden">
          <div
            className="scrollbar-none flex gap-2 overflow-x-auto px-4"
            aria-label={STRINGS.shop.categoryBarLabel}
          >
            {sections.map((section) => {
              const sectionId = section.category.id ?? section.category.name;
              return (
                <FilterChip
                  key={sectionId}
                  variant="tab"
                  label={section.category.name}
                  isActive={sectionId === activeCategoryId}
                  onClick={() => scrollToSection(sectionId)}
                />
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mx-auto flex w-full max-w-[1280px] flex-1 gap-8 md:px-8 md:py-8">
        {!isSearching && sections.length > 1 ? (
          <nav
            aria-label={STRINGS.shop.categoryBarLabel}
            className="sticky top-[6.5rem] hidden h-fit w-56 shrink-0 flex-col gap-1 md:flex"
          >
            {sections.map((section) => {
              const sectionId = section.category.id ?? section.category.name;
              const isActive = sectionId === activeCategoryId;
              return (
                <button
                  key={sectionId}
                  type="button"
                  onClick={() => scrollToSection(sectionId)}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "flex min-h-12 items-center rounded-full px-4 text-left font-sans text-sm font-medium",
                    focusRing,
                    isActive
                      ? "bg-primary-soft text-primary"
                      : "text-body hover:bg-muted",
                  )}
                >
                  {section.category.name}
                </button>
              );
            })}
          </nav>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col pb-24">
          {isSearching ? (
            searchResults.isLoading ? (
              <div className="flex flex-col gap-3 p-5">
                <Skeleton className="h-20 w-full rounded-card" />
                <Skeleton className="h-20 w-full rounded-card" />
              </div>
            ) : visibleProducts.length === 0 ? (
              <EmptyState
                icon={Search}
                title={STRINGS.empty.search.title}
                action={{
                  label: STRINGS.empty.search.action,
                  onClick: () => setSearchQuery(""),
                }}
              />
            ) : (
              <ul>
                {visibleProducts.map((product) => (
                  <li key={product.id}>
                    <ProductCard
                      product={product}
                      storeId={companyId}
                      onOpen={(item) => openProduct(item.id)}
                    />
                  </li>
                ))}
              </ul>
            )
          ) : sections.length === 0 ? (
            <EmptyState
              icon={Search}
              title={STRINGS.empty.storeProducts.title}
              action={{
                label: STRINGS.empty.storeProducts.action,
                onClick: () => router.push("/explore"),
              }}
            />
          ) : (
            sections.map((section) => {
              const sectionId = section.category.id ?? section.category.name;
              return (
                <section
                  key={sectionId}
                  data-section-id={sectionId}
                  ref={(element) => {
                    if (element) sectionRefs.current.set(sectionId, element);
                    else sectionRefs.current.delete(sectionId);
                  }}
                  className="scroll-mt-32"
                >
                  <Text variant="h2" className="px-5 pt-6 pb-3">
                    {section.category.name}
                  </Text>
                  <ul>
                    {section.products.map((product) => (
                      <li key={product.id}>
                        <ProductCard
                          product={product}
                          storeId={companyId}
                          onOpen={(item) => openProduct(item.id)}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })
          )}
        </div>
      </div>

      <VariantSelectorSheet
        target={variantTarget}
        onClose={() => setVariantTarget(null)}
      />
    </div>
  );
}
