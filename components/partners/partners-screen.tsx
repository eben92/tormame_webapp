"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Text } from "@/components/ui/text";
import { focusRing, pressableScale } from "@/components/ui/pressable";
import { ENV } from "@/lib/env";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const COPY = STRINGS.partners;

/** Every call to action on this page opens the portal. */
function PortalLink({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={ENV.VENDOR_URL}
      target="_blank"
      rel="noreferrer noopener"
      title={COPY.openPortalHint}
      className={cn(
        "inline-flex min-h-14 items-center justify-center gap-2 rounded-full px-8",
        "bg-white font-sans text-base font-bold whitespace-nowrap text-[#07301F] shadow-e2",
        "transition-[transform,background-color] duration-200 hover:bg-white/90",
        pressableScale,
        focusRing,
        className,
      )}
    >
      {children}
      <ArrowRight size={18} aria-hidden />
    </a>
  );
}

/**
 * The hero canvas: a photograph of a business making the thing it sells, laid
 * under the brand's own green.
 *
 * The wash is not decoration. White display type over a photograph fails
 * contrast the moment the picture has a bright patch, so the gradient carries
 * the legibility and the photograph carries the mood.
 */
function HeroCanvas() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <Image
        src="/partners/hero-kitchen.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-linear-to-br from-(--hero-gradient-from) via-(--hero-gradient-via) to-(--hero-gradient-to) opacity-[0.82]" />
      {/* Darkest under the words, clearing towards the right so the kitchen is
          actually visible. Contrast is carried here, not by the photograph. */}
      <div className="absolute inset-0 bg-linear-to-r from-[#03271B]/95 via-[#03271B]/70 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-black/25" />
      <div className="absolute -right-32 -bottom-40 size-[30rem] rounded-full bg-(--hero-glow-warm) blur-3xl" />
    </div>
  );
}

/** The same treatment, for the closing block. */
function ClosingCanvas() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <Image
        src="/partners/hero-kitchen.jpg"
        alt=""
        fill
        sizes="(min-width: 768px) 80rem, 100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-linear-to-br from-(--hero-gradient-from) via-(--hero-gradient-via) to-(--hero-gradient-to) opacity-[0.94]" />
      <div className="absolute -right-24 -bottom-32 size-[26rem] rounded-full bg-(--hero-glow-warm) blur-3xl" />
    </div>
  );
}

function SectionTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      data-reveal
      className={cn(
        "font-display text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.12] font-extrabold text-foreground",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function PartnersScreen({
  categoryScroller,
  partnerScroller,
  footer,
}: {
  categoryScroller: React.ReactNode;
  partnerScroller: React.ReactNode;
  footer: React.ReactNode;
}) {
  const root = React.useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) return;

      gsap.from("[data-hero]", {
        y: 24,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.09,
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.from(element, {
          y: 22,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 88%" },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal-group]").forEach((group) => {
        gsap.from(group.querySelectorAll("[data-reveal-item]"), {
          y: 26,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: group, start: "top 84%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="w-full max-w-full overflow-x-hidden bg-background">
      <header className="relative overflow-hidden rounded-b-sheet pt-safe md:rounded-b-[3.5rem]">
        <HeroCanvas />

        <div className="relative mx-auto w-full max-w-[1280px] px-4 pt-4 pb-20 md:px-8 md:pt-6 md:pb-32">
          <nav className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full py-1 pr-3",
                focusRing,
              )}
            >
              <Image
                src="/logo.png"
                alt=""
                width={28}
                height={28}
                priority
                className="rounded-lg"
              />
              <span className="font-sans text-lg font-black tracking-widest text-white">
                TORMAME
              </span>
            </Link>

            <div className="flex items-center gap-1 sm:gap-3">
              <Link
                href="/"
                className={cn(
                  "hidden items-center gap-1.5 rounded-full px-3 py-2 font-sans text-sm font-bold text-white/80 sm:inline-flex",
                  "transition-colors hover:bg-white/15 hover:text-white",
                  focusRing,
                )}
              >
                <ArrowLeft size={16} aria-hidden />
                {COPY.navBack}
              </Link>
              <PortalLink className="min-h-11 px-5 text-sm sm:min-h-12 sm:px-6 sm:text-base">
                {COPY.openPortal}
              </PortalLink>
            </div>
          </nav>

          <div className="mt-16 flex max-w-3xl flex-col items-start gap-6 md:mt-24">
            <h1
              data-hero
              className="font-display text-[clamp(2.25rem,4.8vw,3.75rem)] leading-[1.05] font-extrabold text-balance text-white"
            >
              {COPY.headline}
            </h1>
            <p
              data-hero
              className="max-w-2xl font-sans text-lg leading-relaxed text-white/80 md:text-xl"
            >
              {COPY.subhead}
            </p>

            <div
              data-hero
              className="mt-1 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center"
            >
              <PortalLink className="w-full sm:w-auto">
                {COPY.openPortal}
              </PortalLink>
              <a
                href="#pricing"
                className={cn(
                  "inline-flex min-h-14 items-center justify-center rounded-full border-[1.5px] border-white/40 px-8",
                  "font-sans text-base font-bold text-white",
                  "transition-colors hover:border-white/70 hover:bg-white/10",
                  pressableScale,
                  focusRing,
                )}
              >
                {COPY.seePricing}
              </a>
            </div>

            <p data-hero className="font-sans text-sm font-bold text-white/70">
              {COPY.heroNote(ENV.PARTNER_FREE_SALES)}
            </p>
          </div>
        </div>
      </header>

      {categoryScroller}

      <main className="w-full">
        {/* Why bother. The argument, three lines of it. */}
        <section className="mx-auto w-full max-w-[1280px] px-4 py-20 md:px-8 md:py-28">
          <SectionTitle className="text-center">{COPY.whyTitle}</SectionTitle>

          <div
            data-reveal-group
            className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3 md:gap-8"
          >
            {COPY.why.map((reason) => (
              <div
                key={reason.title}
                data-reveal-item
                className={cn(
                  "flex flex-col gap-3 rounded-card border border-border bg-card p-7",
                  "transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-e2",
                )}
              >
                <span className="h-1 w-12 rounded-full bg-primary" aria-hidden />
                <h3 className="font-display text-xl leading-snug font-bold text-foreground">
                  {reason.title}
                </h3>
                <Text variant="body" className="text-muted-foreground">
                  {reason.body}
                </Text>
              </div>
            ))}
          </div>
        </section>

        {/* What it costs. The question every one of them asks first. */}
        <section
          id="pricing"
          className="scroll-mt-24 border-y border-border bg-muted/40"
        >
          <div className="mx-auto w-full max-w-[64rem] px-4 py-20 md:px-8 md:py-28">
            <SectionTitle className="text-center">
              {COPY.pricingTitle}
            </SectionTitle>

            <div
              data-reveal-group
              className="mt-12 grid gap-5 md:mt-16 md:grid-cols-2 md:gap-6"
            >
              <div
                data-reveal-item
                className="flex flex-col gap-2 rounded-card border-[1.5px] border-primary bg-card p-8"
              >
                <Text variant="caption">{COPY.pricingFreeLabel}</Text>
                <p className="font-display text-[clamp(2rem,4vw,2.75rem)] leading-none font-extrabold text-primary">
                  {COPY.pricingFreeValue(ENV.PARTNER_FREE_SALES)}
                </p>
                <Text variant="body" className="mt-1 text-muted-foreground">
                  {COPY.pricingFreeBody}
                </Text>
              </div>

              <div
                data-reveal-item
                className="flex flex-col gap-2 rounded-card border border-border bg-card p-8"
              >
                <Text variant="caption">{COPY.pricingFeeLabel}</Text>
                <p className="font-display text-[clamp(2rem,4vw,2.75rem)] leading-none font-extrabold text-foreground">
                  {COPY.pricingFeeValue(ENV.PARTNER_FEE_PERCENT)}
                </p>
                <Text variant="body" className="mt-1 text-muted-foreground">
                  {COPY.pricingFeeBody}
                </Text>
              </div>
            </div>

            <p
              data-reveal
              className="mt-6 text-center font-sans text-base text-muted-foreground"
            >
              {COPY.pricingNote}
            </p>
          </div>
        </section>

        {/* How it works. Three steps, no more. */}
        <section className="mx-auto w-full max-w-[64rem] px-4 py-20 md:px-8 md:py-28">
          <SectionTitle className="text-center">{COPY.howTitle}</SectionTitle>

          <ol
            data-reveal-group
            className="mt-12 grid gap-8 md:mt-16 md:grid-cols-3"
          >
            {COPY.steps.map((step, index) => (
              <li key={step.title} data-reveal-item className="flex flex-col gap-3">
                <span
                  aria-hidden
                  className="flex size-12 items-center justify-center rounded-full bg-primary font-display text-xl font-extrabold text-primary-foreground"
                >
                  {index + 1}
                </span>
                <h3 className="font-display text-xl leading-snug font-bold text-foreground">
                  {step.title}
                </h3>
                <Text variant="body" className="text-muted-foreground">
                  {step.body}
                </Text>
              </li>
            ))}
          </ol>
        </section>

        {partnerScroller}

        {/* What you need. The list the application actually asks for. */}
        <section className="mx-auto w-full max-w-[64rem] px-4 py-20 md:px-8 md:py-28">
          <div className="grid gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
            <div className="flex flex-col gap-3">
              <SectionTitle>{COPY.requirementsTitle}</SectionTitle>
              <p
                data-reveal
                className="max-w-md font-sans text-base leading-relaxed text-muted-foreground md:text-lg"
              >
                {COPY.requirementsLead}
              </p>
            </div>

            <ul data-reveal-group className="flex flex-col gap-3">
              {COPY.requirements.map((item) => (
                <li
                  key={item}
                  data-reveal-item
                  className="flex items-start gap-3.5 rounded-card border border-border bg-card p-4"
                >
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft">
                    <Check
                      size={14}
                      strokeWidth={3}
                      className="text-primary"
                      aria-hidden
                    />
                  </span>
                  <Text variant="body-strong" className="text-foreground">
                    {item}
                  </Text>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1280px] px-4 pb-20 md:px-8 md:pb-28">
          <div className="relative overflow-hidden rounded-[2rem] px-6 py-16 md:rounded-[3rem] md:px-16 md:py-20">
            <ClosingCanvas />
            <div className="relative flex flex-col items-center gap-5 text-center">
              <h2
                data-reveal
                className="max-w-2xl font-display text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.1] font-extrabold text-white"
              >
                {COPY.closingTitle}
              </h2>
              <p
                data-reveal
                className="max-w-lg font-sans text-base leading-relaxed text-white/75 md:text-lg"
              >
                {COPY.closingBody}
              </p>
              <PortalLink className="mt-2 w-full sm:w-auto">
                {COPY.openPortal}
              </PortalLink>
            </div>
          </div>
        </section>
      </main>

      {footer}
    </div>
  );
}
