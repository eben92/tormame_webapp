import type { Metadata } from "next";
import { CheckoutScreen } from "@/components/checkout/checkout-screen";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Review your basket and place your order.",
};

export default function CheckoutPage() {
  return <CheckoutScreen />;
}
