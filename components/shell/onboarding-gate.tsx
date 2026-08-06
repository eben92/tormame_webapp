"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { appEntryPath } from "@/lib/app-entry";
import { useOnboardingStore } from "@/stores/onboarding";
import { useUserStore } from "@/stores/user";

/**
 * Sends anyone who hasn't finished onboarding to it, whichever way they entered
 * the application — a landing-page call to action, a bookmark, a shared store
 * link. Doing it here rather than on the buttons means a deep link can't skip
 * the step that tells us which town to show.
 *
 * Renders nothing and sits beside the screen rather than wrapping it: the check
 * needs the URL and persisted state, neither of which exists at prerender, and
 * wrapping would pull every screen out of the static shell a crawler and a slow
 * phone read first.
 */
export function OnboardingGate() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasOnboarded = useOnboardingStore((state) => state.hasOnboarded);
  const onboardingHydrated = useOnboardingStore((state) => state.hasHydrated);
  const user = useUserStore((state) => state.user);
  const userHydrated = useUserStore((state) => state.hasHydrated);

  const hydrated = onboardingHydrated && userHydrated;
  const query = searchParams.toString();
  const target = query ? `${pathname}?${query}` : pathname;

  React.useEffect(() => {
    if (!hydrated || hasOnboarded) return;
    router.replace(
      appEntryPath(target, { hasOnboarded: false, isSignedIn: Boolean(user) }),
    );
  }, [hydrated, hasOnboarded, target, user, router]);

  return null;
}
