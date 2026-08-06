"use client";

import Image from "next/image";
import { Clock, Star, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { focusRing, pressableScale } from "@/components/ui/pressable";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";

export type StoreCardData = {
  id: string;
  name: string;
  category?: string;
  rating?: number | null;
  deliveryTime?: string | null;
  deliveryFee?: string;
  isFeatured?: boolean;
  promoPercent?: number | null;
  imageUrl?: string | null;
};

type StoreCardProps = StoreCardData & {
  onClick?: () => void;
  variant?: "portrait" | "landscape";
  className?: string;
  /** Set on the first card of an above-the-fold rail so it is not lazy-loaded. */
  priority?: boolean;
};

const FALLBACK_IMAGE = "/auth.webp";

/** Delivery time / fee only render when the API actually provides them. */
function StoreMeta({
  deliveryTime,
  deliveryFee,
}: Pick<StoreCardProps, "deliveryTime" | "deliveryFee">) {
  if (!deliveryTime && !deliveryFee) return null;

  return (
    <div className="flex items-center gap-3">
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
    </div>
  );
}

export function StoreCard({
  variant = "portrait",
  name,
  category,
  rating,
  deliveryTime,
  deliveryFee,
  imageUrl,
  isFeatured,
  promoPercent,
  onClick,
  className,
  priority = false,
}: StoreCardProps) {
  const hasPromo = promoPercent != null && promoPercent > 0;
  const hasRating = rating != null && rating > 0;

  if (variant === "landscape") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={name}
        className={cn(
          "flex w-full items-center gap-3 rounded-card border border-border bg-card p-3 text-left",
          "md:hover:shadow-e2",
          pressableScale,
          focusRing,
          className,
        )}
      >
        <span className="relative size-18 shrink-0 overflow-hidden rounded-image bg-muted">
          <Image
            src={imageUrl || FALLBACK_IMAGE}
            alt=""
            fill
            sizes="72px"
            className="object-cover"
          />
          {hasPromo ? (
            <span className="absolute top-1 left-1 rounded-full bg-primary-soft px-2 py-1 font-sans text-xs font-medium text-primary">
              -{promoPercent}%
            </span>
          ) : null}
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-center gap-2">
            <Text as="span" variant="h3" className="flex-1 truncate">
              {name}
            </Text>
            {isFeatured ? <Badge>{STRINGS.home.popularBadge}</Badge> : null}
          </span>
          {category ? (
            <Text as="span" variant="body-small" className="truncate">
              {category}
            </Text>
          ) : null}
          <span className="flex items-center gap-3">
            {hasRating ? (
              <span className="flex items-center gap-1">
                <Star size={12} className="fill-accent text-accent" aria-hidden />
                <Text as="span" variant="body-small">
                  {rating}
                </Text>
              </span>
            ) : null}
            <StoreMeta deliveryTime={deliveryTime} deliveryFee={deliveryFee} />
          </span>
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={name}
      className={cn(
        "group flex w-[196px] shrink-0 flex-col text-left md:w-full",
        pressableScale,
        focusRing,
        className,
      )}
    >
      <span className="relative mb-3 block h-[150px] w-full overflow-hidden rounded-image bg-muted">
        <Image
          src={imageUrl || FALLBACK_IMAGE}
          alt=""
          fill
          sizes="(min-width: 768px) 320px, 196px"
          priority={priority}
          className="object-cover transition-transform duration-500 md:group-hover:scale-105"
        />
        {hasPromo ? (
          <span className="absolute top-2 left-2 rounded-full bg-primary-soft px-2 py-1 font-sans text-xs font-medium text-primary">
            -{promoPercent}%
          </span>
        ) : null}
        {hasRating ? (
          <span className="absolute right-2 bottom-2 flex items-center gap-1 rounded-full bg-(--overlay) px-2 py-1">
            <Star size={12} className="fill-accent text-accent" aria-hidden />
            <span className="font-sans text-xs font-medium text-white">
              {rating}
            </span>
          </span>
        ) : null}
      </span>

      <span className="flex flex-col gap-1">
        <Text as="span" variant="h3" className="truncate">
          {name}
        </Text>
        {category ? (
          <Text as="span" variant="body-small" className="truncate">
            {category}
          </Text>
        ) : null}
        <StoreMeta deliveryTime={deliveryTime} deliveryFee={deliveryFee} />
      </span>
    </button>
  );
}
