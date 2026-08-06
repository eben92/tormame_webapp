"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ArrowLeft, ChevronRight, MapPin } from "lucide-react";
import {
  ORDER_STATUS_TONE_BG,
  ORDER_STATUS_TONE_TEXT,
} from "@/components/shared/order-status-badge";
import {
  getOrderStatusIcon,
  OrderStatusTimeline,
} from "@/components/orders/order-status-timeline";
import { RatingSheet, StarPicker } from "@/components/orders/rating-sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { ErrorState } from "@/components/ui/states";
import { focusRing, pressableScale } from "@/components/ui/pressable";
import {
  useGetOrder,
  useGetPaymentAuthorization,
  useOrderRating,
  useVerifyPayment,
} from "@/lib/api/services/orders";
import { getOrderStatusInfo } from "@/lib/order-status";
import { getOrderPaymentAction } from "@/lib/payment-cta";
import { STRINGS } from "@/lib/strings";
import { cn, formatCedis } from "@/lib/utils";

function DetailsHeader({ title, onBack }: { title?: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 border-b border-border bg-background px-4 pt-3 pb-3 md:px-8">
      <button
        type="button"
        onClick={onBack}
        aria-label={STRINGS.common.back}
        className={cn(
          "flex size-12 items-center justify-center rounded-full bg-muted text-foreground",
          pressableScale,
          focusRing,
        )}
      >
        <ArrowLeft size={20} aria-hidden />
      </button>
      {title ? (
        <Text variant="h3" className="truncate">
          {title}
        </Text>
      ) : null}
    </div>
  );
}

/**
 * Statuses past which the confirmation code is spent. It is what the courier is
 * handed at the door, so it stops being shown the moment the order is
 * delivered — a code still on screen invites someone to read it out again.
 */
const CODE_SPENT_STATUSES = ["PAYMENT_PENDING", "CANCELLED", "DELIVERED", "COMPLETED"];

export function OrderDetailsScreen({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { data: order, isLoading, isError, error, refetch } = useGetOrder(orderId);
  const [ratingSheetOpen, setRatingSheetOpen] = React.useState(false);

  const isRatable =
    order?.status === "DELIVERED" || order?.status === "COMPLETED";
  const { data: rating } = useOrderRating(orderId, Boolean(order) && isRatable);

  const getAuthorization = useGetPaymentAuthorization();
  const verifyPayment = useVerifyPayment();

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col">
        <DetailsHeader onBack={() => router.back()} />
        <div className="mx-auto flex w-full max-w-[52rem] flex-col gap-3 px-4 pt-4 md:px-8">
          <Skeleton className="h-20 w-full rounded-card" />
          <Skeleton className="h-16 w-full rounded-card" />
          <Skeleton className="h-40 w-full rounded-card" />
          <Skeleton className="h-28 w-full rounded-card" />
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-1 flex-col">
        <DetailsHeader onBack={() => router.back()} />
        <ErrorState error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  const shopLabel =
    order.shop_name ?? order.first_item_name ?? STRINGS.orderDetails.fallbackShopName;
  const statusInfo = getOrderStatusInfo(order.status);
  const statusHistory = order.status_history ?? [];
  // Prefer the event matching the current status; fall back to the last one so a
  // momentarily stale history still shows a sensible timestamp.
  const bannerEvent =
    statusHistory.find((event) => event.status === order.status) ??
    statusHistory[statusHistory.length - 1];

  const action = getOrderPaymentAction(order);
  const showCode =
    order.confirmation_code && !CODE_SPENT_STATUSES.includes(order.status);
  const codeLabel =
    order.fulfillment_type === "PICKUP"
      ? STRINGS.orderDetails.pickupCodeLabel
      : STRINGS.orderDetails.deliveryCodeLabel;

  const isActionPending = getAuthorization.isPending || verifyPayment.isPending;

  const openAuthorization = () =>
    getAuthorization.mutate(order.id, {
      onSuccess: (authorization) => {
        const params = new URLSearchParams({
          orderId: order.id,
          reference: order.payment_reference ?? "",
          uri: authorization.authorization_url,
        });
        router.push(`/order-payment?${params.toString()}`);
      },
      onError: () => void refetch(),
    });

  const handlePayAction = () => {
    if (!order.payment_reference) return;
    verifyPayment.mutate(
      { orderId: order.id, reference: order.payment_reference },
      {
        onSuccess: (verified) => {
          if (verified.payment_status === "PAID") return;
          if (order.status === "PAYMENT_PENDING") openAuthorization();
        },
        onError: () => {
          if (order.status === "PAYMENT_PENDING") openAuthorization();
          else void refetch();
        },
      },
    );
  };

  return (
    <div className="flex flex-1 flex-col">
      <DetailsHeader title={shopLabel} onBack={() => router.back()} />

      <div className="mx-auto flex w-full max-w-[52rem] flex-1 flex-col gap-3 p-4 pb-32 md:px-8 md:pb-8">
        <button
          type="button"
          onClick={() => router.push(`/shops/${order.company_id}`)}
          aria-label={STRINGS.orderDetails.viewShopLabel(shopLabel)}
          className={cn(
            "flex min-h-12 items-center gap-2 rounded-card border border-border bg-card p-4 text-left",
            pressableScale,
            focusRing,
          )}
        >
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            {order.fulfillment_type === "PICKUP" ? (
              <span className="mb-0.5 flex items-center gap-1.5">
                <MapPin size={13} className="text-primary" aria-hidden />
                <Text as="span" variant="caption" className="text-primary">
                  {STRINGS.orderDetails.pickupAtTitle}
                </Text>
              </span>
            ) : null}
            <Text as="span" variant="body-strong" className="truncate">
              {shopLabel}
            </Text>
            {order.branch_name ? (
              <Text as="span" variant="body-small" className="truncate text-muted-foreground">
                {order.branch_name}
              </Text>
            ) : null}
            {order.branch_address ? (
              <Text as="span" variant="body-small" className="text-muted-foreground">
                {order.branch_address}
              </Text>
            ) : null}
          </span>
          <ChevronRight size={18} className="text-muted-foreground" aria-hidden />
        </button>

        <div
          className={cn(
            "flex items-center gap-3 rounded-card p-4",
            ORDER_STATUS_TONE_BG[statusInfo.tone],
          )}
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-card">
            {React.createElement(getOrderStatusIcon(statusInfo.icon), {
              size: 20,
              className: ORDER_STATUS_TONE_TEXT[statusInfo.tone],
              "aria-hidden": true,
            })}
          </span>
          <div className="flex flex-1 flex-col gap-0.5">
            <Text variant="h3">{statusInfo.sentence}</Text>
            {bannerEvent ? (
              <Text variant="body-small" className="text-muted-foreground">
                {format(parseISO(bannerEvent.created_at), "dd MMM yyyy, hh:mm a")}
              </Text>
            ) : null}
          </div>
        </div>

        {isRatable && rating ? (
          <button
            type="button"
            onClick={() => setRatingSheetOpen(true)}
            aria-label={`${STRINGS.orderDetails.yourRatingTitle}: ${rating.rating} out of 5. ${STRINGS.orderDetails.editRating}.`}
            className={cn(
              "flex flex-col gap-2 rounded-card border border-border bg-card p-4 text-left",
              pressableScale,
              focusRing,
            )}
          >
            <span className="flex items-center justify-between">
              <Text as="span" variant="caption">
                {STRINGS.orderDetails.yourRatingTitle}
              </Text>
              <span className="flex items-center gap-1">
                <Text as="span" variant="body-strong" className="text-primary">
                  {STRINGS.orderDetails.editRating}
                </Text>
                <ChevronRight size={14} className="text-muted-foreground" aria-hidden />
              </span>
            </span>
            <StarPicker value={rating.rating} readOnly size={18} />
            {rating.comment ? (
              <Text as="span" variant="body-small" className="text-muted-foreground">
                {rating.comment}
              </Text>
            ) : null}
          </button>
        ) : null}

        {order.fulfillment_type === "DELIVERY" && order.delivery_address_snapshot ? (
          <div className="flex flex-col gap-1 rounded-card border border-border bg-card p-4">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-muted-foreground" aria-hidden />
              <Text as="span" variant="caption">
                {STRINGS.orderDetails.deliveryAddressTitle}
              </Text>
            </span>
            <Text variant="body">
              {order.delivery_address_snapshot.formatted_address ??
                order.delivery_address_snapshot.street}
            </Text>
            {order.delivery_address_snapshot.landmark ? (
              <Text variant="body-small" className="text-muted-foreground">
                {order.delivery_address_snapshot.landmark}
              </Text>
            ) : null}
          </div>
        ) : null}

        {showCode ? (
          <div className="flex flex-col items-center gap-1.5 rounded-card border border-dashed border-primary/40 bg-primary-soft p-5">
            <Text variant="caption">{codeLabel}</Text>
            <Text variant="display" className="text-center tracking-[0.25em] text-primary">
              {order.confirmation_code}
            </Text>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 rounded-card border border-border bg-card p-4">
          <Text variant="caption">
            {STRINGS.orderDetails.orderNumberLabel(order.id)}
          </Text>
          <OrderStatusTimeline
            events={statusHistory}
            status={order.status}
            fulfillmentType={order.fulfillment_type}
          />
        </div>

        {order.items && order.items.length > 0 ? (
          <div className="flex flex-col gap-3 rounded-card border border-border bg-card p-4">
            <Text variant="caption">{STRINGS.orderDetails.itemsTitle}</Text>
            {order.items.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <Text variant="body-strong" className="w-8 text-muted-foreground">
                  {item.quantity}×
                </Text>
                <div className="flex flex-1 flex-col gap-0.5">
                  <Text variant="body-strong">{item.product_name}</Text>
                  {item.variant_name ? (
                    <Text variant="body-small" className="text-muted-foreground">
                      {item.variant_name}
                    </Text>
                  ) : null}
                  {item.modifiers?.map((modifier) => (
                    <Text
                      key={modifier.id}
                      variant="body-small"
                      className="text-muted-foreground"
                    >
                      {modifier.modifier_name}: {modifier.option_name}
                    </Text>
                  ))}
                </div>
                <Text variant="body-strong">{formatCedis(item.subtotal)}</Text>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex flex-col gap-2 rounded-card border border-border bg-card p-4">
          <Text variant="caption" className="mb-1">
            {STRINGS.checkout.costBreakdownTitle}
          </Text>
          <div className="flex items-center justify-between">
            <Text variant="body" className="text-muted-foreground">
              {STRINGS.checkout.subtotal}
            </Text>
            <Text variant="body-strong">{formatCedis(order.subtotal_amount)}</Text>
          </div>
          {order.fulfillment_type === "DELIVERY" ? (
            <div className="flex items-center justify-between">
              <Text variant="body" className="text-muted-foreground">
                {STRINGS.checkout.deliveryFee}
              </Text>
              <Text variant="body-strong">
                {order.delivery_fee > 0 ? formatCedis(order.delivery_fee) : "Free"}
              </Text>
            </div>
          ) : null}
          <div className="mt-1 flex items-center justify-between border-t border-border/60 pt-2">
            <Text variant="h3">{STRINGS.checkout.total}</Text>
            <Text variant="h3" className="text-primary">
              {formatCedis(order.total_amount)}
            </Text>
          </div>
        </div>
      </div>

      {action != null || (isRatable && !rating) ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background p-4 pb-safe-gutter md:static md:mx-auto md:w-full md:max-w-[52rem] md:border-0 md:px-8">
          {action != null ? (
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={handlePayAction}
              isLoading={isActionPending}
            >
              {action === "pay"
                ? STRINGS.orders.payNow
                : STRINGS.orders.verifyPayment}
            </Button>
          ) : (
            <Button
              size="lg"
              className="w-full"
              onClick={() => setRatingSheetOpen(true)}
            >
              {STRINGS.orderDetails.rateThisOrder}
            </Button>
          )}
        </div>
      ) : null}

      <RatingSheet
        orderId={order.id}
        existingRating={rating ?? null}
        open={ratingSheetOpen}
        onOpenChange={setRatingSheetOpen}
      />
    </div>
  );
}
