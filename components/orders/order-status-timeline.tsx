"use client";

import { format, parseISO } from "date-fns";
import {
  Bike,
  CheckCircle2,
  Clock,
  Loader,
  Package,
  PartyPopper,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Text } from "@/components/ui/text";
import type {
  FulfillmentType,
  OrderStatusEvent,
} from "@/lib/api/schemas/order";
import {
  getOrderStatusInfo,
  type OrderStatus,
  type OrderStatusTone,
} from "@/lib/order-status";
import { cn } from "@/lib/utils";

/**
 * `getOrderStatusInfo(...).icon` is a plain string so `lib/order-status.ts` stays
 * framework-agnostic. This is the one place those names resolve to real icons —
 * a small local record, not a second status map.
 */
const STATUS_ICONS: Record<string, LucideIcon> = {
  Clock,
  CheckCircle2,
  Loader,
  Package,
  Bike,
  PartyPopper,
  XCircle,
};

export function getOrderStatusIcon(iconName: string): LucideIcon {
  return STATUS_ICONS[iconName] ?? Clock;
}

/**
 * Canonical fulfillment milestones. PAYMENT_PENDING and CANCELLED sit outside
 * this progression on purpose: for those the timeline falls back to the real
 * event list, so no "upcoming" step is ever invented.
 */
const FULFILLMENT_STEPS: Record<FulfillmentType, OrderStatus[]> = {
  DELIVERY: ["PENDING", "ACCEPTED", "PREPARING", "IN_TRANSIT", "DELIVERED"],
  PICKUP: ["PENDING", "ACCEPTED", "PREPARING", "READY_FOR_PICKUP", "COMPLETED"],
};

type StepState = "completed" | "current" | "upcoming";

type TimelineStep = {
  key: string;
  status: string;
  state: StepState;
  /** Absent → the row drops its timestamp line entirely; never a made-up time. */
  timestamp?: string;
};

function buildFulfillmentSteps(
  currentStatus: string,
  fulfillmentType: FulfillmentType,
  events: OrderStatusEvent[],
): TimelineStep[] | null {
  const sequence = FULFILLMENT_STEPS[fulfillmentType];
  if (!sequence) return null;
  const currentIndex = sequence.indexOf(currentStatus as OrderStatus);
  if (currentIndex === -1) return null;

  return sequence.map((status, index) => ({
    key: status,
    status,
    state:
      index < currentIndex
        ? "completed"
        : index === currentIndex
          ? "current"
          : "upcoming",
    timestamp: events.find((event) => event.status === status)?.created_at,
  }));
}

/** Plain event list — everything here already happened. */
function buildEventSteps(events: OrderStatusEvent[]): TimelineStep[] {
  return events.map((event, index) => ({
    key: `${event.status}-${event.created_at}`,
    status: event.status,
    state: index === events.length - 1 ? "current" : "completed",
    timestamp: event.created_at,
  }));
}

function circleClass(state: StepState, tone: OrderStatusTone): string {
  if (state === "current") {
    // A cancelled order's current step is terminal and must read destructive.
    return tone === "error" ? "bg-destructive" : "bg-accent";
  }
  return state === "completed" ? "bg-primary" : "bg-muted";
}

function iconClass(state: StepState, tone: OrderStatusTone): string {
  if (state === "current") {
    return tone === "error"
      ? "text-destructive-foreground"
      : "text-accent-foreground";
  }
  return state === "completed"
    ? "text-primary-foreground"
    : "text-muted-foreground";
}

export function OrderStatusTimeline({
  events,
  status,
  fulfillmentType,
}: {
  events: OrderStatusEvent[];
  status: string;
  fulfillmentType: FulfillmentType;
}) {
  const steps =
    buildFulfillmentSteps(status, fulfillmentType, events) ??
    buildEventSteps(events);
  if (steps.length === 0) return null;

  return (
    <ol>
      {steps.map((step, index) => {
        const info = getOrderStatusInfo(step.status);
        const StepIcon = getOrderStatusIcon(info.icon);
        const isLast = index === steps.length - 1;

        return (
          <li key={step.key} className="flex gap-3">
            <span className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full",
                  circleClass(step.state, info.tone),
                )}
              >
                <StepIcon
                  size={16}
                  className={iconClass(step.state, info.tone)}
                  aria-hidden
                />
              </span>
              {!isLast ? (
                <span
                  className={cn(
                    "my-1 w-0.5 flex-1",
                    // A segment only turns emerald once the step it leads from
                    // is fully complete.
                    step.state === "completed" ? "bg-primary" : "bg-border",
                  )}
                  style={{ minHeight: 20 }}
                />
              ) : null}
            </span>
            <span className="flex flex-1 flex-col gap-0.5 pb-5">
              <Text
                as="span"
                variant={
                  step.state === "current"
                    ? "h3"
                    : step.state === "completed"
                      ? "body-strong"
                      : "body"
                }
                className={step.state === "upcoming" ? "text-muted-foreground" : ""}
              >
                {info.label}
              </Text>
              {step.timestamp ? (
                <Text as="span" variant="body-small" className="text-muted-foreground">
                  {format(parseISO(step.timestamp), "dd MMM yyyy, hh:mm a")}
                </Text>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
