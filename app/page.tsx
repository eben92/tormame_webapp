import { Suspense } from "react";
import type { Metadata } from "next";
import { LobbyFooter } from "@/components/lobby/lobby-footer";
import { LobbyScreen } from "@/components/lobby/lobby-screen";
import { LobbySkeleton } from "@/components/shell/route-skeletons";
import { getCategoryGroups } from "@/lib/api/server/catalog";
import { requestTime } from "@/lib/api/server/request-time";

export const metadata: Metadata = {
  title: "Food, groceries and more, delivered fast",
  description:
    "Browse restaurants, shops and events near you. Order in a few taps and track every delivery.",
  alternates: { canonical: "/" },
};

/** See `requestTime` for why the render is held back to request time. */
async function LandingContent() {
  await requestTime();
  const categories = await getCategoryGroups();
  return (
    <LobbyScreen initialCategories={categories} footer={<LobbyFooter />} />
  );
}

/**
 * The landing page. tormame.com opens here for everyone — signed in or not,
 * onboarded or not — because this is the page that says what the business is.
 *
 * Getting into the application is a deliberate act from here (a category, the
 * search bar, "Start browsing"), and `OnboardingGate` makes sure that act goes
 * through onboarding first when it hasn't been done.
 */
export default function LandingPage() {
  return (
    <Suspense fallback={<LobbySkeleton />}>
      <LandingContent />
    </Suspense>
  );
}
