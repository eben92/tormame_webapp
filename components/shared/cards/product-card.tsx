"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { Text } from "@/components/ui/text";
import { focusRing, pressableScale } from "@/components/ui/pressable";
import type { Product } from "@/lib/api/schemas/product";
import { STRINGS } from "@/lib/strings";
import { cn, formatCedis } from "@/lib/utils";
import { useCartStore } from "@/stores/cart";

type ProductCardProps = {
  product: Product;
  storeId: string;
  onOpen: (product: Product) => void;
};

/** One menu row: photo, name, description, price, and the add/quantity pill. */
export function ProductCard({ product, storeId, onOpen }: ProductCardProps) {
  const cartStoreId = useCartStore((state) => state.storeId);
  const items = useCartStore((state) => state.items);

  const isUnavailable = !product.is_available;
  const quantityInCart =
    cartStoreId === storeId
      ? items
          .filter((item) => item.productId === product.id)
          .reduce((sum, item) => sum + item.quantity, 0)
      : 0;

  const priceLabel = STRINGS.shop.priceFrom(formatCedis(product.min_price));
  const imageUrl = product.images[0]?.url;

  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => !isUnavailable && onOpen(product)}
        disabled={isUnavailable}
        aria-label={
          isUnavailable
            ? `${product.name}, ${STRINGS.shop.unavailableLabel}`
            : `${product.name}, ${priceLabel}`
        }
        className={cn(
          "flex w-full items-center gap-3 px-5 py-4 text-left",
          pressableScale,
          focusRing,
          isUnavailable ? "opacity-60" : "md:hover:bg-muted/50",
        )}
      >
        <span className="relative size-18 shrink-0 overflow-hidden rounded-image bg-muted">
          <Image
            src={imageUrl || "/auth.webp"}
            alt=""
            fill
            sizes="72px"
            className={cn("object-cover", isUnavailable && "grayscale")}
          />
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Text
            as="span"
            variant="h3"
            className={cn("truncate", isUnavailable && "text-muted-foreground")}
          >
            {product.name}
          </Text>
          {/* Always rendered so rows with and without a description keep the same height. */}
          <Text
            as="span"
            variant="body-small"
            className={cn("truncate", isUnavailable && "text-muted-foreground")}
          >
            {product.description ?? ""}
          </Text>
          <Text
            as="span"
            variant="body-strong"
            className={isUnavailable ? "text-muted-foreground" : "text-primary"}
          >
            {isUnavailable ? STRINGS.shop.unavailableLabel : priceLabel}
          </Text>
        </span>

        {!isUnavailable ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary">
            {quantityInCart > 0 ? (
              <span className="font-sans text-xs font-medium text-primary-foreground">
                {quantityInCart}
              </span>
            ) : (
              <Plus
                size={18}
                strokeWidth={2.5}
                className="text-primary-foreground"
                aria-hidden
              />
            )}
          </span>
        ) : null}
      </button>
    </div>
  );
}
