import { Suspense } from "react";
import type { Metadata } from "next";
import { OnboardingScreen } from "@/components/onboarding/onboarding-screen";

export const metadata: Metadata = { title: "Welcome" };

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingScreen />
    </Suspense>
  );
}
