"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ErrorState } from "@/components/ui/states";
import { useGetOrder } from "@/lib/api/services/orders";
import { STRINGS } from "@/lib/strings";
import { useCartStore } from "@/stores/cart";

/**
 * Payment hand-off.
 *
 * The native app hosts Paystack in a WebView and listens for the backend's
 * post-payment message. A browser has no such channel: Paystack's configured
 * callback returns to the backend's own receipt page, whose "View order" button
 * only speaks to a React Native WebView, which would strand a web customer
 * there after paying.
 *
 * So the web flow keeps this page as the anchor: Paystack opens in a second
 * tab, and this screen polls the order until the backend reports it paid, then
 * sends the customer to the outcome screen. It works no matter which page
 * Paystack redirects that other tab to.
 */
export function OrderPaymentScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authorizationUrl = searchParams.get("uri");
  const orderId = searchParams.get("orderId") ?? "";
  const reference = searchParams.get("reference") ?? "";
  const clearCart = useCartStore((state) => state.clearCart);

  const [popupBlocked, setPopupBlocked] = React.useState(false);
  const hasOpenedRef = React.useRef(false);

  // `useGetOrder` already polls every 4s while payment is PENDING.
  const { data: order } = useGetOrder(orderId);

  const openPaystack = React.useCallback(() => {
    if (!authorizationUrl) return;
    const paymentWindow = window.open(authorizationUrl, "_blank", "noopener");
    setPopupBlocked(paymentWindow === null);
  }, [authorizationUrl]);

  React.useEffect(() => {
    if (!authorizationUrl || hasOpenedRef.current) return;
    hasOpenedRef.current = true;
    clearCart();
    openPaystack();
  }, [authorizationUrl, clearCart, openPaystack]);

  // The backend is the only authority on whether money moved.
  React.useEffect(() => {
    if (!order) return;
    if (order.payment_status === "PAID") {
      const params = new URLSearchParams({ orderId, reference });
      if (order.confirmation_code) params.append("code", order.confirmation_code);
      router.replace(`/callback/success?${params.toString()}`);
    }
  }, [order, orderId, reference, router]);

  if (!authorizationUrl) {
    return (
      <div className="flex min-h-dvh flex-col">
        <ErrorState
          error={new Error("Missing payment link")}
          onRetry={() =>
            router.replace(orderId ? `/order-details/${orderId}` : "/orders")
          }
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-8">
      <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
      <Text variant="h1" className="text-center">
        {STRINGS.payment.headerTitle}
      </Text>
      <Text variant="body" className="text-center">
        {popupBlocked
          ? STRINGS.payment.popupBlockedMessage
          : STRINGS.payment.waitingMessage}
      </Text>

      <div className="mt-2 flex w-full max-w-sm flex-col gap-3">
        <Button size="lg" className="w-full" onClick={openPaystack}>
          <ExternalLink size={18} aria-hidden />
          {STRINGS.payment.openPaymentCta}
        </Button>
        <Button
          size="lg"
          variant="ghost"
          className="w-full"
          onClick={() =>
            router.replace(orderId ? `/order-details/${orderId}` : "/orders")
          }
        >
          {STRINGS.payment.backToOrders}
        </Button>
      </div>
    </div>
  );
}
