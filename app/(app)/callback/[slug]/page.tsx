import { Suspense } from "react";
import type { Metadata } from "next";
import { OrderOutcomeScreen } from "@/components/checkout/order-outcome-screen";

export const metadata: Metadata = {
  title: "Payment",
  robots: { index: false, follow: false },
};

/** Awaited inside the boundary so the route still prerenders a shell. */
async function Outcome({ params }: Pick<PageProps<"/callback/[slug]">, "params">) {
  const { slug } = await params;
  return <OrderOutcomeScreen outcome={slug === "success" ? "success" : "failure"} />;
}

export default function PaymentCallbackPage({
  params,
}: PageProps<"/callback/[slug]">) {
  return (
    <Suspense>
      <Outcome params={params} />
    </Suspense>
  );
}
