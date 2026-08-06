"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import {
  PAYMENT_FAILED,
  PAYMENT_PAID,
  PaymentRedirectOrderSchema,
} from "@/lib/api/schemas/payment";

/** Same cadence as the page this replaces: five checks, three seconds apart. */
export const POLL_INTERVAL_MS = 3000;
export const MAX_POLLS = 5;
export const POLL_WINDOW_MS = MAX_POLLS * POLL_INTERVAL_MS;

/**
 * Payment status for a Paystack reference.
 *
 * Polling stops on its own: on a final answer, or once the window that started
 * at `windowStartedAt` has elapsed. Deciding that inside `refetchInterval`
 * (which receives the query) keeps the caller free of bookkeeping state.
 *
 * `retry: false` matches the original page in quups_web — a failed lookup means
 * the reference is unknown, and three more attempts only delay the message.
 */
export function useGetPaymentRedirect(
  reference: string,
  options: { windowStartedAt: number },
) {
  return useQuery({
    queryKey: ["payment-redirect", reference],
    queryFn: () =>
      apiFetch(
        `/orders/payment-redirect?reference=${encodeURIComponent(reference)}`,
        { schema: PaymentRedirectOrderSchema },
      ),
    enabled: Boolean(reference),
    retry: false,
    refetchInterval: (query) => {
      const status = query.state.data?.payment_status;
      if (status === PAYMENT_PAID || status === PAYMENT_FAILED) return false;

      // A failed lookup is final. The reference is unknown (404) or the backend
      // is down; polling it every three seconds forever only flickers a spinner
      // at someone who needs to be told what happened.
      if (query.state.error) return false;

      // Measured from whichever answer came last, so an error that arrives
      // before any data still closes the window.
      const updatedAt = Math.max(
        query.state.dataUpdatedAt,
        query.state.errorUpdatedAt,
      );
      if (updatedAt && updatedAt - options.windowStartedAt >= POLL_WINDOW_MS) {
        return false;
      }
      return POLL_INTERVAL_MS;
    },
  });
}
