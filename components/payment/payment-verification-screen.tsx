"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CircleAlert, Loader2 } from "lucide-react";
import { BrandMark } from "@/components/shell/brand-bar";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useRecaptcha } from "@/hooks/use-recaptcha";
import {
  PAYMENT_FAILED,
  PAYMENT_PAID,
  type PaymentRedirectOrder,
} from "@/lib/api/schemas/payment";
import {
  POLL_WINDOW_MS,
  useGetPaymentRedirect,
} from "@/lib/api/services/payment";
import { STRINGS } from "@/lib/strings";
import { formatCedis } from "@/lib/utils";

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (message: string) => void };
  }
}

/** Contract mirrored in quups_app: app/(protected)/(global)/order-payment.tsx. */
type AppMessage = { type: "VIEW_ORDER"; orderId: string } | { type: "CLOSE" };

function postToApp(message: AppMessage) {
  window.ReactNativeWebView?.postMessage(JSON.stringify(message));
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-[26rem] rounded-card border border-border bg-card p-6 shadow-e1 md:p-8">
        <BrandMark href="/home" className="mx-auto mb-6 w-fit" size={32} />
        {children}
      </div>
    </div>
  );
}

function Centered({
  icon,
  title,
  message,
  children,
}: {
  icon?: React.ReactNode;
  title?: string;
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      {icon}
      {title ? <Text variant="h3">{title}</Text> : null}
      <Text variant="body-small" className="text-muted-foreground">
        {message}
      </Text>
      {children ? <div className="mt-2 w-full">{children}</div> : null}
    </div>
  );
}

function Spinner() {
  return (
    <Loader2
      className="size-8 animate-spin text-primary"
      aria-label={STRINGS.common.loading}
    />
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
      <Text
        as="span"
        variant={strong ? "body-strong" : "body-small"}
        className={strong ? undefined : "text-muted-foreground"}
      >
        {label}
      </Text>
      <Text
        as="span"
        variant={strong ? "body-strong" : "body-small"}
        className={strong ? undefined : "text-muted-foreground"}
      >
        {value}
      </Text>
    </div>
  );
}

/**
 * Where Paystack sends a customer back to.
 *
 * The original lives in quups_web and only knows how to talk to the native app
 * through `ReactNativeWebView`. This one keeps that handoff — the same page can
 * still be loaded inside the app's WebView — but when it is a plain browser it
 * navigates within the website instead, which is what a customer who ordered on
 * the web actually needs.
 */
export function PaymentVerificationScreen({ reference }: { reference: string }) {
  const router = useRouter();
  const { state: recaptchaState, retry: retryRecaptcha } = useRecaptcha(
    "payment_verification",
  );

  // The polling window is measured, not counted: five checks three seconds
  // apart is the same thing as "keep asking for fifteen seconds", and elapsed
  // time is derivable each render instead of needing state updated from an
  // effect. Refresh restarts the window.
  const [windowStartedAt, setWindowStartedAt] = React.useState(() => Date.now());

  const { data, isLoading, error, dataUpdatedAt, refetch } =
    useGetPaymentRedirect(reference, {
      enabled: recaptchaState === "passed",
      windowStartedAt,
    });

  const pollingExhausted =
    dataUpdatedAt > 0 && dataUpdatedAt - windowStartedAt >= POLL_WINDOW_MS;

  const goHome = () => {
    if (window.ReactNativeWebView) postToApp({ type: "CLOSE" });
    else router.replace("/home");
  };

  const viewOrder = (orderId: string) => {
    if (window.ReactNativeWebView) postToApp({ type: "VIEW_ORDER", orderId });
    else router.replace(`/order-details/${orderId}`);
  };

  if (!reference) {
    return (
      <Card>
        <Centered
          icon={<CircleAlert size={32} className="text-destructive" aria-hidden />}
          title={STRINGS.paymentVerification.invalidLinkTitle}
          message={STRINGS.paymentVerification.invalidLinkMessage}
        >
          <Button className="w-full" onClick={goHome}>
            {STRINGS.paymentVerification.backHome}
          </Button>
        </Centered>
      </Card>
    );
  }

  if (recaptchaState === "failed") {
    return (
      <Card>
        <Centered
          icon={<CircleAlert size={32} className="text-destructive" aria-hidden />}
          title={STRINGS.paymentVerification.botCheckFailedTitle}
          message={STRINGS.paymentVerification.botCheckFailedMessage}
        >
          <Button className="w-full" onClick={retryRecaptcha}>
            {STRINGS.paymentVerification.refresh}
          </Button>
        </Centered>
      </Card>
    );
  }

  if (recaptchaState === "checking") {
    return (
      <Card>
        <Centered
          icon={<Spinner />}
          message={STRINGS.paymentVerification.checkingHumanMessage}
        />
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <Centered
          icon={<Spinner />}
          message={STRINGS.paymentVerification.confirmingMessage}
        />
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <Centered
          icon={<CircleAlert size={32} className="text-destructive" aria-hidden />}
          title={STRINGS.paymentVerification.lookupErrorTitle}
          message={STRINGS.paymentVerification.lookupErrorMessage}
        >
          <Button className="w-full" onClick={goHome}>
            {STRINGS.paymentVerification.backHome}
          </Button>
        </Centered>
      </Card>
    );
  }

  if (data.payment_status === PAYMENT_FAILED) {
    return (
      <Card>
        <Centered
          icon={<CircleAlert size={32} className="text-destructive" aria-hidden />}
          title={STRINGS.paymentVerification.failedTitle}
          message={STRINGS.paymentVerification.orderReferenceLabel(data.order_id)}
        >
          <Button className="w-full" onClick={goHome}>
            {STRINGS.paymentVerification.backHome}
          </Button>
        </Centered>
      </Card>
    );
  }

  if (data.payment_status !== PAYMENT_PAID) {
    return (
      <Card>
        {!pollingExhausted ? (
          <Centered
            icon={<Spinner />}
            message={STRINGS.paymentVerification.confirmingMessage}
          />
        ) : (
          <Centered
            title={STRINGS.paymentVerification.slowTitle}
            message={STRINGS.paymentVerification.slowMessage}
          >
            <Button
              className="w-full"
              onClick={() => {
                setWindowStartedAt(Date.now());
                void refetch();
              }}
            >
              {STRINGS.paymentVerification.refresh}
            </Button>
          </Centered>
        )}
      </Card>
    );
  }

  return <PaidCard order={data} onViewOrder={viewOrder} />;
}

function PaidCard({
  order,
  onViewOrder,
}: {
  order: PaymentRedirectOrder;
  onViewOrder: (orderId: string) => void;
}) {
  const where = [order.shop_name, order.branch_name].filter(Boolean).join(" · ");

  return (
    <Card>
      <div className="flex flex-col items-center gap-2 text-center">
        <CheckCircle2 size={40} className="text-primary" aria-hidden />
        <Text variant="h2">{STRINGS.paymentVerification.paidTitle}</Text>
        {where ? (
          <Text variant="body-small" className="text-muted-foreground">
            {where}
          </Text>
        ) : null}
      </div>

      <div className="mt-6 divide-y divide-border rounded-card border border-border">
        {order.items.map((item, index) => (
          <Row
            key={`${item.name}-${index}`}
            label={`${item.quantity}× ${item.name}`}
            value={formatCedis(item.price)}
          />
        ))}
        <Row
          label={STRINGS.paymentVerification.subtotal}
          value={formatCedis(order.subtotal_amount)}
        />
        <Row
          label={STRINGS.paymentVerification.deliveryFee}
          value={formatCedis(order.delivery_fee)}
        />
        <Row
          label={STRINGS.paymentVerification.total}
          value={formatCedis(order.total_amount)}
          strong
        />
      </div>

      <Text variant="body-small" className="mt-4 text-center text-muted-foreground">
        {STRINGS.paymentVerification.orderIdLabel(order.order_id)}
      </Text>

      <Button
        size="lg"
        className="mt-4 w-full"
        onClick={() => onViewOrder(order.order_id)}
      >
        {STRINGS.paymentVerification.viewOrder}
      </Button>
    </Card>
  );
}
