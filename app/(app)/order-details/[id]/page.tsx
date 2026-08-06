import type { Metadata } from "next";
import { OrderDetailsScreen } from "@/components/orders/order-details-screen";

export const metadata: Metadata = { title: "Order details" };

export default async function OrderDetailsPage({
  params,
}: PageProps<"/order-details/[id]">) {
  const { id } = await params;
  return <OrderDetailsScreen orderId={id} />;
}
