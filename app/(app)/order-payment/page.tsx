import { Suspense } from "react";
import type { Metadata } from "next";
import { OrderPaymentScreen } from "@/components/checkout/order-payment-screen";

export const metadata: Metadata = { title: "Complete payment" };

export default function OrderPaymentPage() {
  return (
    <Suspense>
      <OrderPaymentScreen />
    </Suspense>
  );
}
