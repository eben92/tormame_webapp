export type OrderStatusTone = 'progress' | 'success' | 'warning' | 'error';

export type OrderStatusInfo = {
  label: string;
  sentence: string;
  tone: OrderStatusTone;
  /** lucide icon name consumed by badge/timeline components */
  icon: string;
};

/**
 * THE single API-status → human-copy map. Keys must match `Order.status`
 * exactly as sent by the API (see services/orders/type.ts and the former
 * STATUS_CONFIG in components/shared/order-status-badge.tsx).
 */
export const ORDER_STATUS_MAP = {
  PAYMENT_PENDING: {
    label: 'Waiting for payment',
    sentence: "We're waiting for your payment to go through.",
    tone: 'warning',
    icon: 'Clock',
  },
  PENDING: {
    label: 'Order placed',
    sentence: "We've received your order and sent it to the store.",
    tone: 'progress',
    icon: 'Clock',
  },
  ACCEPTED: {
    label: 'Order confirmed',
    sentence: 'The store has accepted your order.',
    tone: 'progress',
    icon: 'CheckCircle2',
  },
  PREPARING: {
    label: 'Getting ready',
    sentence: 'The store is getting your order ready.',
    tone: 'progress',
    icon: 'Loader',
  },
  READY_FOR_PICKUP: {
    label: 'Ready for pickup',
    sentence: 'Your order is packed and ready to be picked up.',
    tone: 'progress',
    icon: 'Package',
  },
  IN_TRANSIT: {
    label: 'On the way',
    sentence: 'Your order is on the way to you.',
    tone: 'progress',
    icon: 'Bike',
  },
  DELIVERED: {
    label: 'Delivered',
    sentence: 'Delivered. Enjoy!',
    tone: 'success',
    icon: 'PartyPopper',
  },
  COMPLETED: {
    label: 'Completed',
    sentence: 'Your order is complete. Enjoy!',
    tone: 'success',
    icon: 'PartyPopper',
  },
  CANCELLED: {
    label: 'Cancelled',
    sentence: 'This order was cancelled.',
    tone: 'error',
    icon: 'XCircle',
  },
} as const satisfies Record<string, OrderStatusInfo>;

export type OrderStatus = keyof typeof ORDER_STATUS_MAP;

const FALLBACK: OrderStatusInfo = {
  label: 'In progress',
  sentence: "We're checking on your order.",
  tone: 'progress',
  icon: 'Clock',
};

export function getOrderStatusInfo(status: string): OrderStatusInfo {
  return (ORDER_STATUS_MAP as Record<string, OrderStatusInfo>)[status] ?? FALLBACK;
}

/**
 * Statuses where the order is still going somewhere, so its state can change
 * without the customer doing anything.
 *
 * This is the gate for live polling: with no order in one of these states there
 * is nothing to watch, and the app stops calling the backend entirely. It is
 * also the Orders screen's "Active" tab filter — the two must stay identical,
 * because the shared query key is what lets the screen and the background
 * watcher share a single request instead of issuing two.
 */
export const ACTIVE_ORDER_STATUSES = [
  'PAYMENT_PENDING',
  'PENDING',
  'ACCEPTED',
  'PREPARING',
  'IN_TRANSIT',
  'READY_FOR_PICKUP',
] as const;

export function isActiveOrderStatus(status: string | undefined | null): boolean {
  if (!status) return false;
  return (ACTIVE_ORDER_STATUSES as readonly string[]).includes(status);
}
