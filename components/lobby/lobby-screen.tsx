"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { CategoryBubbles } from "@/components/lobby/category-bubbles";
import { LobbyAddressButton } from "@/components/lobby/lobby-address-button";
import { useGetCategories, type CategoryChip } from "@/lib/api/services/catalog";
import { STRINGS } from "@/lib/strings";

gsap.registerPlugin(useGSAP, ScrollTrigger);

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

export function LobbyScreen() {
  const router = useRouter();
  const { data, isLoading } = useGetCategories();
  const categories = React.useMemo<CategoryChip[]>(() => data ?? [], [data]);

  const handleCategoryPress = (categoryId: string) =>
    router.push(`/home?category=${categoryId}`);

  // A single vertical is not a choice — send those customers straight to the
  // store list, same as the native lobby.
  const shouldRedirectHome = !isLoading && categories.length === 1;
  React.useEffect(() => {
    if (shouldRedirectHome) router.replace("/home");
  }, [shouldRedirectHome, router]);

  if (isLoading || shouldRedirectHome) {
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
    <>
      <LobbyMobile
        categories={categories}
        onCategoryPress={handleCategoryPress}
        onSignIn={() => router.push("/auth/signin")}
        onBrowse={() => router.push("/home")}
      />
      <LobbyDesktop
        categories={categories}
        onCategoryPress={handleCategoryPress}
        onSignIn={() => router.push("/auth/signin")}
        onBrowse={() => router.push("/home")}
      />
    </>
  );
}

type LobbyViewProps = {
  categories: CategoryChip[];
  onCategoryPress: (categoryId: string) => void;
  onSignIn: () => void;
  onBrowse: () => void;
};

/** Pixel-for-pixel port of the native lobby screen. */
function LobbyMobile({
  categories,
  onCategoryPress,
  onSignIn,
  onBrowse,
}: LobbyViewProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background md:hidden">
      <div className="flex flex-1 flex-col bg-linear-to-br from-primary to-primary-pressed pt-safe">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <BrandMark />
          <LobbyAddressButton />
        </div>

        <div className="mx-4 mt-4 overflow-hidden rounded-2xl bg-(--header-scrim-top) p-4">
          <Badge className="mb-3 self-start bg-white/20 px-3 py-1 text-[11px] font-bold text-white">
            {STRINGS.lobby.badge}
          </Badge>
          <Text variant="display" className="whitespace-pre-line text-white">
            {STRINGS.lobby.headline}
          </Text>
          <Text variant="body-small" className="mt-2 text-white/75">
            {STRINGS.lobby.subtitle}
          </Text>
        </div>

        <CategoryBubbles
          categories={categories}
          onCategoryPress={onCategoryPress}
        />

        <div className="flex-1" />

        <div className="relative h-[90px] overflow-hidden rounded-t-[28px]">
          <Image
            src="/auth.webp"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 0px"
            className="object-cover"
          />
        </div>
      </div>

      <div className="border-t border-border bg-background px-4 pt-3 pb-4 pb-safe">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onSignIn}
            className="flex-1 rounded-xl text-primary"
          >
            {STRINGS.lobby.signIn}
          </Button>
          <Button onClick={onBrowse} className="flex-1 rounded-xl">
            {STRINGS.lobby.startBrowsing}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Editorial landing page for desktop: same tokens, same copy, wider stage. */
function LobbyDesktop({
  categories,
  onCategoryPress,
  onSignIn,
  onBrowse,
}: LobbyViewProps) {
  const root = React.useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) return;

      gsap.from("[data-animate='hero-item']", {
        y: 28,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.09,
      });

      gsap.to("[data-animate='hero-photo']", {
        yPercent: 12,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.from("[data-animate='categories']", {
        y: 40,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-animate='categories']",
          start: "top 85%",
        },
      });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="hidden min-h-dvh flex-col bg-background md:flex"
    >
      <header className="sticky top-0 z-40 px-8 pt-6">
        <nav className="mx-auto flex h-[4.5rem] w-full max-w-[1280px] items-center justify-between rounded-full bg-foreground/85 px-6 backdrop-blur-md">
          <BrandMark size={28} />
          <div className="flex items-center gap-3">
            <LobbyAddressButton className="bg-white/15" />
            <Button
              variant="ghost"
              onClick={onSignIn}
              className="text-white hover:bg-white/15 active:bg-white/15 active:text-white"
            >
              {STRINGS.lobby.signIn}
            </Button>
            <Button onClick={onBrowse}>{STRINGS.lobby.startBrowsing}</Button>
          </div>
        </nav>
      </header>

      <section className="relative -mt-[6.5rem] flex min-h-[38rem] items-center overflow-hidden">
        <div className="absolute inset-0" data-animate="hero-photo">
          <Image
            src="/auth.webp"
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 100vw, 0px"
            className="scale-110 object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-br from-primary/85 to-primary-pressed/90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--header-scrim-bottom)_100%)]" />
        </div>

        <div className="relative mx-auto flex w-full max-w-[1280px] flex-col items-center gap-6 px-8 pt-40 pb-24 text-center">
          <Badge
            data-animate="hero-item"
            className="bg-white/20 px-4 py-1.5 text-sm font-bold text-white"
          >
            {STRINGS.lobby.badge}
          </Badge>
          <h1
            data-animate="hero-item"
            className="max-w-5xl font-display text-[clamp(3rem,5.5vw,5rem)] leading-[1.05] font-extrabold text-white"
          >
            {STRINGS.lobby.headline.replace("\n", " ")}
          </h1>
          <p
            data-animate="hero-item"
            className="max-w-2xl font-sans text-lg leading-8 text-white/80"
          >
            {STRINGS.lobby.subtitle}
          </p>
          <div data-animate="hero-item" className="mt-2 flex gap-4">
            <Button
              size="lg"
              onClick={onBrowse}
              className="bg-white text-primary hover:bg-white/90 active:bg-white/90"
            >
              {STRINGS.lobby.startBrowsing}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onSignIn}
              className="border-white/40 bg-transparent text-white hover:bg-white/10 active:bg-white/10 active:text-white"
            >
              {STRINGS.lobby.signIn}
            </Button>
          </div>
        </div>
      </section>

      <section
        data-animate="categories"
        className="mx-auto w-full max-w-[1280px] px-8 py-24"
      >
        <Text variant="h2" className="mb-8">
          {STRINGS.explore.categoriesTitle}
        </Text>
        <div className="rounded-card bg-linear-to-br from-primary to-primary-pressed p-6">
          <CategoryBubbles
            categories={categories}
            onCategoryPress={onCategoryPress}
          />
        </div>
      </section>
    </div>
  );
}
