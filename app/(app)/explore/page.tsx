import { Suspense } from "react";
import type { Metadata } from "next";
import { ExploreScreen } from "@/components/explore/explore-screen";

export const metadata: Metadata = {
  title: "Explore",
  description: "Search restaurants, items and events near you.",
};

export default function ExplorePage() {
  return (
    <Suspense>
      <ExploreScreen />
    </Suspense>
  );
}
