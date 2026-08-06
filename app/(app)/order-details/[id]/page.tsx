import { Suspense } from "react";
import type { Metadata } from "next";
import { OrderDetailsScreen } from "@/components/orders/order-details-screen";
import { OrderDetailsSkeleton } from "@/components/shell/route-skeletons";

export const metadata: Metadata = {
  title: "Order details",
  robots: { index: false, follow: false },
};

/**
 * The order itself can't be prerendered: `/orders/{id}` needs the customer's
 * bearer token, which lives in the browser. What the shell can carry is the
 * whole frame around it, so the page paints instantly and only the order rows
 * fill in — which is also why `params` is awaited in here rather than above.
 */
async function OrderDetails({
  params,
}: Pick<PageProps<"/order-details/[id]">, "params">) {
  const { id } = await params;
  return <OrderDetailsScreen orderId={id} />;
}

export default function OrderDetailsPage({
  params,
}: PageProps<"/order-details/[id]">) {
  return (
    <Suspense fallback={<OrderDetailsSkeleton />}>
      <OrderDetails params={params} />
    </Suspense>
  );
}
