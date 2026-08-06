"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Search } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { focusRing, pressableScale } from "@/components/ui/pressable";
import { CategoryTiles } from "@/components/lobby/category-tiles";
import { LobbyAddressButton } from "@/components/lobby/lobby-address-button";
import { DEFAULT_APP_PATH, appEntryPath } from "@/lib/app-entry";
import { ENV } from "@/lib/env";
import type { CategoriesGroup } from "@/lib/api/schemas/catalog";
import {
  useGetCategories,
  type CategoryChip,
} from "@/lib/api/services/catalog";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding";
import { useUserStore } from "@/stores/user";

gsap.registerPlugin(useGSAP);

function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <span className="flex shrink-0 items-center gap-2">
      <Image
        src="/logo.png"
        alt=""
        width={size}
        height={size}
        priority
        className="rounded-lg"
      />
      <span className="font-sans text-xl font-black tracking-widest text-white">
        TORMAME
      </span>
    </span>
  );
}

/**
 * Deep-green header canvas with two soft light sources — the brand's block.
 * Painted from the `--hero-*` tokens, which hold the same values in both
 * themes; the themed palette inverts, and this block must not.
 */
function Ambience() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-linear-to-br from-(--hero-gradient-from) via-(--hero-gradient-via) to-(--hero-gradient-to)" />
      <div className="absolute -top-24 -left-20 size-72 rounded-full bg-(--hero-glow-cool) blur-3xl" />
      <div className="absolute -right-24 -bottom-28 size-80 rounded-full bg-(--hero-glow-warm) blur-3xl" />
    </div>
  );
}

export function LobbyScreen({
  /** Verticals prerendered on the server — the lobby paints with its grid. */
  initialCategories,
  /**
   * The footer, rendered on the server and passed in rather than imported, so
   * its markup and its dozen links stay out of the client bundle.
   */
  footer,
}: {
  initialCategories?: CategoriesGroup[] | null;
  footer: React.ReactNode;
}) {
  const router = useRouter();
  const { data, isLoading } = useGetCategories(initialCategories);
  const categories = React.useMemo<CategoryChip[]>(() => data ?? [], [data]);
  const root = React.useRef<HTMLDivElement>(null);

  const hasOnboarded = useOnboardingStore((state) => state.hasOnboarded);
  const isSignedIn = Boolean(useUserStore((state) => state.user));

  /**
   * Every way into the application from here goes through onboarding when it
   * hasn't been done. `OnboardingGate` enforces the same rule for anyone who
   * arrives by another route; doing it here as well spares the customer a
   * redirect they can see.
   */
  const enterApp = (target: string) =>
    router.push(appEntryPath(target, { hasOnboarded, isSignedIn }));

  const handleCategoryPress = (categoryId: string) =>
    enterApp(`${DEFAULT_APP_PATH}?category=${categoryId}`);

  // A single vertical is not a choice, so the grid is dropped rather than shown
  // with one tile in it. The page still stands — it is the landing page, and it
  // still has to introduce the brand and point at the store list. (The native
  // lobby redirects here instead; a website cannot, or a search result for the
  // homepage would bounce visitors straight past it.)
  const hasCategoryChoice = categories.length > 1;

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) return;

      gsap.from("[data-animate='intro']", {
        y: 20,
        opacity: 0,
        duration: 0.55,
        ease: "power3.out",
        stagger: 0.08,
      });
    },
    { scope: root, dependencies: [isLoading] },
  );

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2
          className="size-6 animate-spin text-primary"
          aria-label={STRINGS.common.loading}
        />
      </div>
    );
  }

  return (
    <div ref={root} className="flex min-h-dvh flex-col bg-background">
      {/* The brand block: everything green is the header, everything below it
          is the shop floor. Same shape on both layouts — only the gutters,
          type sizes and the nav row change. */}
      <header className="relative overflow-hidden rounded-b-sheet pt-safe md:rounded-b-[3rem]">
        <Ambience />

        <div className="relative mx-auto w-full max-w-[1280px] px-4 pt-4 pb-6 md:px-8 md:pt-6 md:pb-12">
          <div className="flex items-center justify-between gap-3">
            <BrandMark size={26} />
            <div className="flex items-center gap-1 md:gap-3">
              <LobbyAddressButton className="hidden lg:flex" />
              {/* Vendor onboarding lives on its own site, so this is a real
                  link out rather than a route. */}
              <a
                href={ENV.VENDOR_URL}
                target="_blank"
                rel="noreferrer noopener"
                title={STRINGS.lobby.becomePartnerHint}
                className={cn(
                  "inline-flex rounded-full px-2 py-2 font-sans text-xs font-bold whitespace-nowrap text-white",
                  "sm:px-3 sm:text-sm",
                  "transition-colors hover:bg-white/15",
                  focusRing,
                )}
              >
                {STRINGS.lobby.becomePartner}
              </a>
              <Button
                variant="ghost"
                onClick={() => router.push("/auth/signin")}
                className="text-white hover:bg-white/15 active:bg-white/15 active:text-white"
              >
                {STRINGS.lobby.signIn}
              </Button>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-start gap-2.5 md:mt-12 md:items-center md:gap-3 md:text-center">
            <h1
              data-animate="intro"
              className="max-w-4xl font-display text-[2.125rem] leading-[1.08] font-extrabold whitespace-pre-line text-white md:text-[clamp(2.75rem,4.6vw,4rem)] md:leading-[1.05]"
            >
              {STRINGS.lobby.headline}
            </h1>
            {/* Desktop only: on a phone the headline already says this, and the
                tiles matter more than a second line of marketing above the
                fold. */}
            <Text
              variant="body-small"
              className="hidden max-w-xl text-white/70 md:block md:text-lg"
            >
              {STRINGS.lobby.subtitle}
            </Text>

            <div
              data-animate="intro"
              className="mt-2 flex w-full flex-col gap-2.5 md:max-w-2xl md:flex-row md:items-center md:gap-3"
            >
              <SearchPill onPress={() => enterApp(DEFAULT_APP_PATH)} />
              <LobbyAddressButton className="w-full justify-start bg-white/15 md:hidden" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 pt-6 pb-10 md:px-8 md:pt-12 md:pb-16">
        {hasCategoryChoice ? (
          <>
            <div className="mb-4 flex flex-col gap-1 md:mb-7 md:items-center md:text-center">
              <h2 className="font-display text-xl leading-tight font-extrabold text-foreground md:text-[2rem]">
                {STRINGS.lobby.categoriesTitle}
              </h2>
              <Text variant="body-small" className="max-w-2xl md:text-base">
                {STRINGS.lobby.categoriesSubtitle}
              </Text>
            </div>

            <CategoryTiles
              categories={categories}
              onCategoryPress={handleCategoryPress}
            />
          </>
        ) : null}

        <div
          className={cn(
            "flex flex-col gap-2.5 md:flex-row md:justify-center",
            hasCategoryChoice ? "mt-6 md:mt-10" : "mt-2",
          )}
        >
          <Button
            size="lg"
            onClick={() => enterApp(DEFAULT_APP_PATH)}
            className="w-full shadow-e2 md:w-auto md:px-10"
          >
            {STRINGS.lobby.startBrowsing}
            <ArrowRight size={18} aria-hidden />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push("/auth/signin")}
            className="w-full md:hidden"
          >
            {STRINGS.lobby.signIn}
          </Button>
        </div>
      </main>

      {footer}
    </div>
  );
}

/**
 * Not an input: search lives on the store list, and a field here would ask the
 * customer to type before we know their city. It looks like a search bar
 * because that is the fastest way into the catalogue.
 */
function SearchPill({ onPress }: { onPress: () => void }) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={STRINGS.home.searchLabel}
      className={cn(
        "flex min-h-12 w-full items-center gap-2.5 rounded-full bg-hero-field px-4 py-3 text-left shadow-e2",
        "hover:bg-hero-field/90",
        pressableScale,
        focusRing,
      )}
    >
      <Search size={18} className="shrink-0 text-hero-field-icon" aria-hidden />
      <span className="truncate font-sans text-sm font-medium text-hero-field-foreground">
        {STRINGS.home.searchPlaceholder}
      </span>
    </button>
  );
}
