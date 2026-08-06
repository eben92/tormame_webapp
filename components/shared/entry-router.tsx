"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/stores/onboarding";
import { useUserStore } from "@/stores/user";

/**
 * The entry decision, mirroring the native `app/index.tsx`:
 *
 * - onboarded → `/home` when signed in, else `/lobby`
 * - not onboarded → `/onboarding`
 *
 * The native app also holds a 2s brand splash and adopts a city from the saved
 * default address; on web there is nothing to wait for, so this routes as soon
 * as the persisted stores have hydrated (`/home` itself adopts the city at
 * sign-in). The logo below is only ever visible for that hydration tick.
 */
export function EntryRouter() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const userHydrated = useUserStore((state) => state.hasHydrated);
  const hasOnboarded = useOnboardingStore((state) => state.hasOnboarded);
  const onboardingHydrated = useOnboardingStore((state) => state.hasHydrated);

  const hydrated = userHydrated && onboardingHydrated;

  React.useEffect(() => {
    if (!hydrated) return;
    if (!hasOnboarded) {
      router.replace(user ? "/onboarding?mode=city-only" : "/onboarding");
      return;
    }
    router.replace(user ? "/home" : "/lobby");
  }, [hydrated, hasOnboarded, user, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <Image src="/logo.png" alt="" width={140} height={140} priority className="rounded-3xl" />
    </div>
  );
}
