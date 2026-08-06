import { Suspense } from "react";
import type { Metadata } from "next";
import { OrderOutcomeScreen } from "@/components/checkout/order-outcome-screen";

export const metadata: Metadata = { title: "Order placed" };

export default function OrderConfirmationPage() {
  return (
    <Suspense>
      <OrderOutcomeScreen outcome="success" />
    </Suspense>
  );
}
