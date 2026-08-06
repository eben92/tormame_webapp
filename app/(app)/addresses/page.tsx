import type { Metadata } from "next";
import { AddressesScreen } from "@/components/profile/addresses-screen";

export const metadata: Metadata = { title: "Saved addresses" };

export default function AddressesPage() {
  return <AddressesScreen />;
}
