import { Suspense } from "react";
import type { Metadata } from "next";
import { HomeScreen } from "@/components/home/home-screen";

export const metadata: Metadata = {
  title: "Home",
  description: "Restaurants, shops and events near you.",
};

export default function HomePage() {
  return (
    <Suspense>
      <HomeScreen />
    </Suspense>
  );
}
