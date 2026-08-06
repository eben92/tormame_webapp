"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { MapPin } from "lucide-react";
import {
  ORDER_STATUS_TONE_BG,
  ORDER_STATUS_TONE_TEXT,
} from "@/components/shared/order-status-badge";
import {
  getOrderStatusIcon,
  OrderStatusTimeline,
} from "@/components/orders/order-status-timeline";
import { Text } from "@/components/ui/text";
import type { Order } from "@/lib/api/schemas/order";
import { getOrderStatusInfo } from "@/lib/order-status";
import { STRINGS } from "@/lib/strings";
import { cn, formatCedis } from "@/lib/utils";

/**
 * Statuses past which the confirmation code is spent. It is what the courier is
 * handed at the door, so it stops being shown the moment the order is
 * delivered — a code still on screen invites someone to read it out again.
 */
export const CODE_SPENT_STATUSES = [
  "PAYMENT_PENDING",
  "CANCELLED",
  "DELIVERED",
  "COMPLETED",
];

/**
 * Everything about an order that is the same whether you are signed in or
 * following a tracking link: where it has got to, where it is going, the code,
 * the items and what it cost.
 *
 * Shared by the signed-in details screen and the public tracking page so a
 * customer sees one account of their order, not two that drift apart. Anything
 * that needs a session — paying, rating, cancelling — stays with the caller.
 */
export function OrderProgress({ order }: { order: Order }) {
  const statusInfo = getOrderStatusInfo(order.status);
  const statusHistory = order.status_history ?? [];

  // Prefer the event matching the current status; fall back to the last one so a
  // momentarily stale history still shows a sensible timestamp.
  const bannerEvent =
    statusHistory.find((event) => event.status === order.status) ??
    statusHistory[statusHistory.length - 1];

  const showCode =
    order.confirmation_code && !CODE_SPENT_STATUSES.includes(order.status);
  const codeLabel =
    order.fulfillment_type === "PICKUP"
      ? STRINGS.orderDetails.pickupCodeLabel
      : STRINGS.orderDetails.deliveryCodeLabel;

  return (
    <>
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
    </>
  );
}
