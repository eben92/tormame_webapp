"use client";

import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { Text } from "@/components/ui/text";
import { focusRing, pressableScale } from "@/components/ui/pressable";
import { cartItemCount, formatCartTotal, useCartStore } from "@/stores/cart";
import { cn } from "@/lib/utils";

// `/order-details` pins its own full-width action to the bottom of the phone
// ("Pay now", "Rate this order"). The pill would cover it, and two competing
// bottom CTAs is worse than none — the basket is one tap away from any tab.
const HIDDEN_ON = ["/checkout", "/order-payment", "/order-details"];
const TAB_ROUTES = ["/home", "/explore", "/orders", "/profile"];

/**
 * Floating basket summary, pinned above the tab bar on mobile and to the bottom
 * right on desktop. Hidden while the basket is empty and on checkout itself.
 */
export function GlobalCartBar() {
  const router = useRouter();
  const pathname = usePathname();
  const items = useCartStore((state) => state.items);
  const hasHydrated = useCartStore((state) => state.hasHydrated);

  const totalCount = cartItemCount(items);
  const isHidden = HIDDEN_ON.some((route) => pathname.startsWith(route));
  const isTabScreen = TAB_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (!hasHydrated || totalCount === 0 || isHidden) return null;

  const itemLabel = `${totalCount} item${totalCount !== 1 ? "s" : ""}`;
  const totalFormatted = formatCartTotal(items);

  return (
    <>
      {/* Holds the height the floating pill covers, the same way the tab bar
          holds its own, so the last row of a screen can be scrolled clear of
          it. Mobile only: on desktop the pill floats in a corner the content
          column never reaches. */}
      <div className="h-(--cart-bar-height) shrink-0 md:hidden" aria-hidden />
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 px-4 pb-safe-gutter",
          isTabScreen && "mb-16 md:mb-0",
          "md:inset-x-auto md:right-8 md:bottom-8 md:w-[22rem] md:px-0",
        )}
      >
        <button
          type="button"
          onClick={() => router.push("/checkout")}
          aria-label={`View basket, ${itemLabel}, total ${totalFormatted}`}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-full bg-primary px-5 py-4 shadow-e2",
            pressableScale,
            focusRing,
          )}
        >
          <span className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-full bg-white/20">
              <ShoppingBag
                size={14}
                className="text-primary-foreground"
                aria-hidden
              />
            </span>
            <span className="font-sans text-[13px] font-bold text-primary-foreground">
              {itemLabel}
            </span>
          </span>
          <Text
            as="span"
            variant="body-small"
            className="font-medium text-primary-foreground"
          >
            View Basket
          </Text>
          <Text
            as="span"
            variant="body-strong"
            className="text-lg text-primary-foreground"
          >
            {totalFormatted}
          </Text>
        </button>
      </div>
    </>
  );
}
