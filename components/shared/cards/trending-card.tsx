"use client";

import Image from "next/image";
import { Clock, Star, Truck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { focusRing, pressableScale } from "@/components/ui/pressable";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";

export type TrendingCardData = {
  id: string;
  name: string;
  rating?: number | null;
  deliveryTime?: string | null;
  deliveryFee?: string;
  promoPercent?: number | null;
  imageUrl?: string | null;
};

type TrendingCardProps = TrendingCardData & {
  onClick?: () => void;
  className?: string;
};

/**
 * Up to three labelled icon+value pairs. Each collapses on its own when the
 * field is absent — never a bare icon, a "0", or an "N/A".
 */
function TrendingMeta({
  rating,
  deliveryTime,
  deliveryFee,
}: Pick<TrendingCardProps, "rating" | "deliveryTime" | "deliveryFee">) {
  const hasRating = rating != null && rating > 0;
  if (!hasRating && !deliveryTime && !deliveryFee) return null;

  return (
    <span className="flex items-center gap-3">
      {hasRating ? (
        <span className="flex items-center gap-1">
          <Star size={12} className="fill-accent text-accent" aria-hidden />
          <Text as="span" variant="body-small">
            {rating}
          </Text>
        </span>
      ) : null}
      {deliveryTime ? (
        <span className="flex items-center gap-1">
          <Clock size={12} className="text-muted-foreground" aria-hidden />
          <Text as="span" variant="body-small">
            {deliveryTime}
          </Text>
        </span>
      ) : null}
      {deliveryFee ? (
        <span className="flex items-center gap-1">
          <Truck size={12} className="text-muted-foreground" aria-hidden />
          <Text as="span" variant="body-small">
            {deliveryFee}
          </Text>
        </span>
      ) : null}
    </span>
  );
}

/**
 * Card for the snap-scrolling Trending rail. Deliberately not a StoreCard
 * variant: fixed 16:9 image, peek width driven by the rail, and an amber promo
 * badge only when `promo_percent` is set.
 */
export function TrendingCard({
  name,
  rating,
  deliveryTime,
  deliveryFee,
  promoPercent,
  imageUrl,
  onClick,
  className,
}: TrendingCardProps) {
  const hasPromo = promoPercent != null && promoPercent > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={name}
      className={cn(
        "group flex w-[78vw] shrink-0 snap-start flex-col text-left md:w-full",
        pressableScale,
        focusRing,
        className,
      )}
    >
      <span className="relative block aspect-video w-full overflow-hidden rounded-image bg-muted">
        <Image
          src={imageUrl || "/auth.webp"}
          alt=""
          fill
          sizes="(min-width: 768px) 400px, 78vw"
          className="object-cover transition-transform duration-500 md:group-hover:scale-105"
        />
        {hasPromo ? (
          <span className="absolute top-2 left-2 rounded-full bg-accent px-2 py-1 font-sans text-xs font-medium text-accent-foreground">
            {STRINGS.home.trendingPromoBadge(promoPercent)}
          </span>
        ) : null}
      </span>

      <span className="mt-3 flex flex-col gap-1">
        <Text as="span" variant="body-strong" className="line-clamp-2">
          {name}
        </Text>
        <TrendingMeta
          rating={rating}
          deliveryTime={deliveryTime}
          deliveryFee={deliveryFee}
        />
      </span>
    </button>
  );
}

/** Mirrors TrendingCard's shape: image block + two text lines + meta line. */
export function TrendingCardSkeleton() {
  return (
    <div className="w-[78vw] shrink-0 md:w-full">
      <Skeleton className="aspect-video w-full rounded-image" />
      <div className="mt-3 flex flex-col gap-2">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-2/5" />
      </div>
    </div>
  );
}
