import { Suspense } from "react";
import type { Metadata } from "next";
import { OnboardingScreen } from "@/components/onboarding/onboarding-screen";
import { OnboardingSkeleton } from "@/components/shell/route-skeletons";
import { getCities } from "@/lib/api/server/catalog";
import { requestTime } from "@/lib/api/server/request-time";

export const metadata: Metadata = {
  title: "Welcome",
  robots: { index: false, follow: false },
};

/** The town list is server data, so the wheel is populated on first paint. */
async function OnboardingContent() {
  await requestTime();
  const cities = await getCities();
  return <OnboardingScreen initialCities={cities} />;
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingSkeleton />}>
      <OnboardingContent />
    </Suspense>
  );
}
