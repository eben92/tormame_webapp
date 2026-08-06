"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useVerifyPayment } from "@/lib/api/services/orders";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart";
import { useCheckoutStore } from "@/stores/checkout";

type Outcome = "success" | "failure";

/**
 * Where Paystack returns to. `reference` is confirmed with the backend before
 * anything is claimed, so the screen never reports a success the API disagrees
 * with. Also serves as the plain order-confirmation screen when the outcome is
 * already known.
 */
export function OrderOutcomeScreen({ outcome }: { outcome: Outcome }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";
  const reference = searchParams.get("reference") ?? "";
  const code = searchParams.get("code") ?? "";

  const clearCart = useCartStore((state) => state.clearCart);
  const resetCheckout = useCheckoutStore((state) => state.reset);
  const verifyPayment = useVerifyPayment();

  const [verifiedStatus, setVerifiedStatus] = React.useState<string | null>(null);
  const hasVerifiedRef = React.useRef(false);

  React.useEffect(() => {
    if (outcome !== "success") return;
    clearCart();
    resetCheckout();
  }, [outcome, clearCart, resetCheckout]);

  // Confirm the payment with the backend once — the query string alone is not
  // proof that money moved.
  React.useEffect(() => {
    if (hasVerifiedRef.current || !orderId || !reference) return;
    hasVerifiedRef.current = true;
    verifyPayment.mutate(
      { orderId, reference },
      { onSuccess: (order) => setVerifiedStatus(order.payment_status) },
    );
  }, [orderId, reference, verifyPayment]);

  const isVerifying = verifyPayment.isPending;
  const isSuccess =
    verifiedStatus === "PAID" || (outcome === "success" && !verifiedStatus);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-8">
      <div
        className={cn(
          "flex size-20 items-center justify-center rounded-full",
          isSuccess ? "bg-primary-soft" : "bg-destructive/10",
        )}
      >
        {isVerifying ? (
          <Loader2 className="size-9 animate-spin text-primary" aria-hidden />
        ) : isSuccess ? (
          <CheckCircle2 size={36} className="text-primary" aria-hidden />
        ) : (
          <XCircle size={36} className="text-destructive" aria-hidden />
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Text variant="h1" className="text-center">
          {isSuccess
            ? STRINGS.payment.successTitle
            : STRINGS.payment.failureTitle}
        </Text>
        <Text variant="body" className="text-center">
          {isSuccess
            ? STRINGS.payment.successMessage
            : STRINGS.payment.failureMessage}
        </Text>
      </div>

      {isSuccess && code ? (
        <Text variant="body-small" className="text-center">
          {STRINGS.payment.confirmationCodeLabel}{" "}
          <Text as="span" variant="body-strong">
            {code}
          </Text>
        </Text>
      ) : null}

      <div className="mt-2 flex w-full max-w-sm flex-col gap-3">
        {isSuccess ? (
          <Button
            size="lg"
            className="w-full"
            onClick={() =>
              router.replace(orderId ? `/order-details/${orderId}` : "/orders")
            }
          >
            {STRINGS.payment.viewOrder}
          </Button>
        ) : (
          <>
            <Button
              size="lg"
              className="w-full"
              onClick={() =>
                router.replace(orderId ? `/order-details/${orderId}` : "/checkout")
              }
            >
              {STRINGS.payment.retryPayment}
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="w-full"
              onClick={() => router.replace("/orders")}
            >
              {STRINGS.payment.backToOrders}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
