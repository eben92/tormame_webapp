import type { Metadata } from "next";
import { ShopScreen } from "@/components/shop/shop-screen";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse the menu and order for delivery or pickup.",
};

export default async function ShopPage({ params }: PageProps<"/shops/[slug]">) {
  const { slug } = await params;
  return <ShopScreen companyId={slug} />;
}
