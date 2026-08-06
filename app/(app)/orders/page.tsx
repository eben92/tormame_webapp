import type { Metadata } from "next";
import { OrdersScreen } from "@/components/orders/orders-screen";

export const metadata: Metadata = {
  title: "My Orders",
  description: "Track your active orders and browse past ones.",
};

export default function OrdersPage() {
  return <OrdersScreen />;
}
