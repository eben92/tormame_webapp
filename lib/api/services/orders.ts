"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { offsetPaginated } from "@/lib/api/schemas/common";
import {
  OrderPlacementSchema,
  OrderRatingSchema,
  OrderSchema,
  OrderTrackingSchema,
  PaymentAuthorizationSchema,
  type Order,
  type PlaceOrderInput,
} from "@/lib/api/schemas/order";
import { ACTIVE_ORDER_STATUSES, isActiveOrderStatus } from "@/lib/order-status";

const ORDERS_PAGE_LIMIT = 10;

/**
 * How often a live order is re-read while the tab is visible. Statuses move on a
 * scale of minutes, so this is comfortably live while staying cheap.
 */
const ORDER_POLL_INTERVAL_MS = 15_000;

/** Faster cadence while a payment is confirming — the customer is watching. */
const PAYMENT_POLL_INTERVAL_MS = 4_000;

const OrdersPageSchema = offsetPaginated(OrderSchema);

export function useCreateOrder() {
  return useMutation({
    mutationFn: (input: PlaceOrderInput) =>
      apiFetch("/orders", {
        method: "POST",
        body: input,
        schema: OrderPlacementSchema,
      }),
  });
}

/**
 * The public lookup behind the tracking page: the contact details on the order
 * plus the delivery code. No session — a customer who checked out as a guest
 * has no account to sign in to.
 */
export function useTrackOrderByContact() {
  return useMutation({
    mutationFn: (input: { contact: string; code: string }) =>
      apiFetch("/orders/track", {
        method: "POST",
        body: input,
        schema: OrderTrackingSchema,
      }),
  });
}

/**
 * Reads an order using a scoped tracking token — the one in the link we email
 * when a payment is confirmed, or the one the lookup above hands back.
 *
 * The token is passed explicitly rather than left to the client's own
 * `Authorization` header: a signed-in visitor's user token is rejected by this
 * endpoint, and a signed-out one has no token at all.
 */
export function useTrackOrderByToken(
  orderId: string | null,
  token: string | null,
) {
  return useQuery({
    queryKey: ["order-tracking", orderId],
    queryFn: () =>
      apiFetch(`/orders/${orderId}/track`, {
        schema: OrderSchema,
        headers: { Authorization: `Bearer ${token}` },
      }),
    enabled: Boolean(orderId && token),
    retry: false,
    refetchInterval: (query) =>
      isActiveOrderStatus(query.state.data?.status)
        ? ORDER_POLL_INTERVAL_MS
        : false,
    refetchIntervalInBackground: false,
  });
}

export function useGetOrder(orderId: string) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => apiFetch(`/orders/${orderId}`, { schema: OrderSchema }),
    enabled: Boolean(orderId),
    refetchInterval: (query) => {
      const order = query.state.data;
      // Awaiting payment confirmation: the customer is staring at the screen.
      if (order?.payment_status === "PENDING") return PAYMENT_POLL_INTERVAL_MS;
      // A settled order can no longer change; polling it would be pure waste.
      return isActiveOrderStatus(order?.status) ? ORDER_POLL_INTERVAL_MS : false;
    },
    refetchIntervalInBackground: false,
  });
}

export function useOrdersList(statuses?: string[], enabled = true) {
  const key = statuses?.join(",") ?? "all";

  return useInfiniteQuery({
    enabled,
    queryKey: ["orders", key],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams();
      params.append("limit", String(ORDERS_PAGE_LIMIT));
      params.append("offset", String(pageParam * ORDERS_PAGE_LIMIT));
      if (statuses?.length) params.append("statuses", statuses.join(","));
      return apiFetch(`/orders?${params.toString()}`, {
        schema: OrdersPageSchema,
      });
    },
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      (lastPageParam + 1) * ORDERS_PAGE_LIMIT < (lastPage.meta.total ?? 0)
        ? lastPageParam + 1
        : undefined,
    select: (data): Order[] => data.pages.flatMap((page) => page.data),
    // Poll only while the list actually holds something that can change.
    refetchInterval: (query) => {
      const orders =
        query.state.data?.pages.flatMap((page) => page.data) ?? [];
      return orders.some((order) => isActiveOrderStatus(order.status))
        ? ORDER_POLL_INTERVAL_MS
        : false;
    },
    refetchIntervalInBackground: false,
  });
}

/**
 * Watches the customer's active orders app-wide. Passes exactly the statuses the
 * Orders screen's Active tab uses, so both share one request rather than running
 * two timers against the same endpoint.
 */
export function useActiveOrdersWatcher(enabled: boolean) {
  const query = useOrdersList(
    enabled ? [...ACTIVE_ORDER_STATUSES] : undefined,
    enabled,
  );
  return {
    hasActiveOrders: (query.data ?? []).some((order) =>
      isActiveOrderStatus(order.status),
    ),
  };
}

export function useGetPaymentAuthorization() {
  return useMutation({
    mutationFn: (orderId: string) =>
      apiFetch(`/orders/${orderId}/payment/authorization`, {
        schema: PaymentAuthorizationSchema,
      }),
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      reference,
    }: {
      orderId: string;
      reference: string;
    }) =>
      apiFetch(
        `/orders/${orderId}/payment/callback?reference=${encodeURIComponent(reference)}`,
        { method: "POST", schema: OrderSchema },
      ),
    onSuccess: (_data, { orderId }) => {
      void queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      void queryClient.invalidateQueries({ queryKey: ["orders"], exact: false });
    },
  });
}

export function useOrderRating(orderId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["order-rating", orderId],
    enabled,
    queryFn: async () => {
      try {
        return await apiFetch(`/orders/${orderId}/rating`, {
          schema: OrderRatingSchema,
        });
      } catch (error) {
        // 404 means "not rated yet", which is a state, not a failure.
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
  });
}

export function useSubmitOrderRating(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { rating: number; comment?: string }) =>
      apiFetch(`/orders/${orderId}/rating`, {
        method: "PUT",
        body: input,
        schema: OrderRatingSchema,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["order-rating", orderId] });
    },
  });
}
