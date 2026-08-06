import { Suspense } from "react";
import type { Metadata } from "next";
import { OrderOutcomeScreen } from "@/components/checkout/order-outcome-screen";

export const metadata: Metadata = { title: "Payment" };

export default async function PaymentCallbackPage({
  params,
}: PageProps<"/callback/[slug]">) {
  const { slug } = await params;
  return (
    <Suspense>
      <OrderOutcomeScreen outcome={slug === "success" ? "success" : "failure"} />
    </Suspense>
  );
}
