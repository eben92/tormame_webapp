import { Suspense } from "react";
import type { Metadata } from "next";
import { ExploreScreen } from "@/components/explore/explore-screen";
import { ExploreSkeleton } from "@/components/shell/route-skeletons";
import { getCategoryGroups } from "@/lib/api/server/catalog";
import { requestTime } from "@/lib/api/server/request-time";

export const metadata: Metadata = {
  title: "Explore",
  description: "Search restaurants, items and events near you.",
  alternates: { canonical: "/explore" },
};

/** Only the chips are server data — results depend on what the customer types. */
async function ExploreContent() {
  await requestTime();
  const categories = await getCategoryGroups();
  return <ExploreScreen initialCategories={categories} />;
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<ExploreSkeleton />}>
      <ExploreContent />
    </Suspense>
  );
}
