import { Suspense } from "react";
import type { Metadata } from "next";
import { HomeScreen } from "@/components/home/home-screen";
import { HomeSkeleton } from "@/components/shell/route-skeletons";
import {
  COMPANIES_PAGE_SIZE,
  getCategoryGroups,
  getCompaniesPage,
} from "@/lib/api/server/catalog";
import { requestTime } from "@/lib/api/server/request-time";

export const metadata: Metadata = {
  title: "Home",
  description: "Restaurants, shops and events near you.",
  alternates: { canonical: "/home" },
};

/**
 * All three reads are cached on the server and issued together, so the rails
 * arrive in one streamed chunk rather than three browser round trips. The
 * screen still owns the queries — these are just their starting values, marked
 * stale so the client revalidates (and resolves city-specific delivery fees)
 * in the background.
 */
async function HomeContent() {
  await requestTime();
  const [categories, popular, trending] = await Promise.all([
    getCategoryGroups(),
    getCompaniesPage({ sort: "popular", limit: COMPANIES_PAGE_SIZE }),
    getCompaniesPage({ sort: "trending", limit: COMPANIES_PAGE_SIZE }),
  ]);

  return (
    <HomeScreen
      initialCategories={categories}
      initialPopular={popular}
      initialTrending={trending}
    />
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
