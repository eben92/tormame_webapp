"use client";

import Image from "next/image";
import { format, parseISO } from "date-fns";
import { ChevronRight } from "lucide-react";
import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { focusRing, pressableScale } from "@/components/ui/pressable";
import type { Order } from "@/lib/api/schemas/order";
import { orderImageUrl } from "@/lib/order-image";
import { getOrderPaymentAction } from "@/lib/payment-cta";
import { STRINGS } from "@/lib/strings";
import { cn, formatCedis } from "@/lib/utils";

type OrderCardProps = {
  order: Order;
  onOpen: () => void;
  onPayAction: () => void;
  isActionPending?: boolean;
};

export function OrderCard({
  order,
  onOpen,
  onPayAction,
  isActionPending,
}: OrderCardProps) {
  const action = getOrderPaymentAction(order);
  // shop_name is optional on the API type — fall back so the row never renders
  // a blank identifier.
  const identifier =
    order.shop_name ?? order.first_item_name ?? STRINGS.orderDetails.fallbackShopName;
  const shopLabel = order.branch_name
    ? `${identifier} · ${order.branch_name}`
    : identifier;
  const dateLabel = format(parseISO(order.created_at), "dd MMM, hh:mm a");
  const total = formatCedis(order.total_amount);

  const payActionLabel = isActionPending
    ? STRINGS.orders.checkingPayment
    : action === "pay"
      ? STRINGS.orders.payNow
      : STRINGS.orders.verifyPayment;

  return (
    <div
      className={cn(
        "flex min-h-12 items-center gap-3 border-b border-border px-4 py-3 md:px-0",
        "md:rounded-card md:border md:px-4 md:hover:shadow-e1",
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={STRINGS.orders.viewDetailsAction}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-3 text-left",
          pressableScale,
          focusRing,
        )}
      >
        <span className="relative size-14 shrink-0 overflow-hidden rounded-image bg-muted">
          <Image
            src={orderImageUrl(order)}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
          />
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <Text as="span" variant="h3" className="truncate">
            {shopLabel}
          </Text>
          <span className="flex items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <Text as="span" variant="body-small">
              {dateLabel}
            </Text>
          </span>
          <Text as="span" variant="body-strong">
            {total}
          </Text>
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-2">
        {action != null ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={onPayAction}
            isLoading={isActionPending}
            aria-label={STRINGS.orders.payActionLabel(payActionLabel)}
          >
            {payActionLabel}
          </Button>
        ) : null}
        <ChevronRight size={18} className="text-muted-foreground" aria-hidden />
      </div>
    </div>
  );
}
