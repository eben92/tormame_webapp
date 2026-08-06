"use client";

import Image from "next/image";
import { ChevronRight, Star, Truck } from "lucide-react";
import { Text } from "@/components/ui/text";
import { focusRing, pressableScale } from "@/components/ui/pressable";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";

/** Store row that heads a search result group. */
export function SearchStoreHeader({
  name,
  imageUrl,
  deliveryFee,
  rating,
  onClick,
}: {
  name: string;
  imageUrl?: string | null;
  deliveryFee?: string;
  rating?: number | null;
  onClick?: () => void;
}) {
  const hasRating = rating != null && rating > 0;
  const hasMeta = Boolean(deliveryFee) || hasRating;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={name}
      className={cn(
        "flex min-h-12 w-full items-center gap-3 px-4 text-left md:px-0",
        pressableScale,
        focusRing,
      )}
    >
      <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-muted">
        <Image
          src={imageUrl || "/auth.webp"}
          alt=""
          fill
          sizes="40px"
          className="object-cover"
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Text as="span" variant="h3" className="truncate">
          {name}
        </Text>
        {hasMeta ? (
          <span className="flex items-center gap-3">
            {deliveryFee ? (
              <span className="flex items-center gap-1">
                <Truck size={12} className="text-muted-foreground" aria-hidden />
                <Text as="span" variant="body-small">
                  {deliveryFee}
                </Text>
              </span>
            ) : null}
            {hasRating ? (
              <span className="flex items-center gap-1">
                <Star size={12} className="fill-accent text-accent" aria-hidden />
                <Text as="span" variant="body-small">
                  {rating}
                </Text>
              </span>
            ) : null}
          </span>
        ) : null}
      </span>
      <ChevronRight size={16} className="text-muted-foreground" aria-hidden />
    </button>
  );
}

/** Product tile inside a store's search rail. */
export function SearchProductCard({
  name,
  imageUrl,
  minPrice,
  onClick,
}: {
  name: string;
  imageUrl?: string | null;
  minPrice: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${name}, ${minPrice}`}
      className={cn(
        "flex w-[38vw] shrink-0 flex-col text-left md:w-full",
        pressableScale,
        focusRing,
      )}
    >
      <span className="relative mb-2 block h-[110px] w-full overflow-hidden rounded-image bg-muted">
        <Image
          src={imageUrl || "/auth.webp"}
          alt=""
          fill
          sizes="(min-width: 768px) 220px, 38vw"
          className="object-cover"
        />
      </span>
      <span className="flex flex-col gap-0.5 px-0.5">
        <Text as="span" variant="body-strong" className="line-clamp-2">
          {name}
        </Text>
        <Text as="span" variant="body-strong" className="text-primary">
          {minPrice}
        </Text>
      </span>
    </button>
  );
}

/**
 * Terminal tile of a search rail, shown only when a store has more products than
 * the rail displays. Matches SearchProductCard's shape so the row stays flush.
 */
export function SearchViewAllCard({
  storeName,
  onClick,
}: {
  storeName: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={STRINGS.explore.viewAllProductsLabel(storeName)}
      className={cn(
        "flex w-[38vw] shrink-0 flex-col text-left md:w-full",
        pressableScale,
        focusRing,
      )}
    >
      <span className="mb-2 flex h-[110px] w-full items-center justify-center rounded-image border border-border bg-card">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted">
          <ChevronRight size={20} className="text-foreground" aria-hidden />
        </span>
      </span>
      <Text as="span" variant="body-strong" className="px-0.5">
        {STRINGS.explore.viewAllProducts}
      </Text>
    </button>
  );
}
