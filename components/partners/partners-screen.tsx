"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Text } from "@/components/ui/text";
import { focusRing, pressableScale } from "@/components/ui/pressable";
import { PartnerArtwork } from "@/components/partners/partner-artwork";
import { ENV } from "@/lib/env";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const COPY = STRINGS.partners;

/** The section every CTA on this page leads to. */
function PortalLink({
  variant = "solid",
  className,
  children,
}: {
  variant?: "solid" | "onDark";
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
        "font-sans text-base font-bold whitespace-nowrap",
        "transition-[transform,background-color,box-shadow] duration-200",
        variant === "solid"
          ? "bg-primary text-primary-foreground shadow-e2 hover:bg-primary-pressed"
          : "bg-white text-[#07301F] shadow-e2 hover:bg-white/90",
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
 * The deep green canvas the brand uses for its header, painted from the same
 * `--hero-*` tokens as the landing page so the two pages read as one site.
 */
function Ambience() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-(--hero-gradient-from) via-(--hero-gradient-via) to-(--hero-gradient-to)" />
      <div className="absolute -top-32 -left-28 size-[26rem] rounded-full bg-(--hero-glow-cool) blur-3xl" />
      <div className="absolute -right-32 -bottom-40 size-[30rem] rounded-full bg-(--hero-glow-warm) blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #FFFFFF 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
    </div>
  );
}

function SectionHeading({
  title,
  lead,
  align = "center",
  onDark = false,
}: {
  title: string;
  lead?: string;
  align?: "center" | "start";
  onDark?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start",
      )}
    >
      <h2
        data-reveal
        className={cn(
          "max-w-3xl font-display text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.12] font-extrabold",
          onDark ? "text-white" : "text-foreground",
        )}
      >
        {title}
      </h2>
      {lead ? (
        <p
          data-reveal
          className={cn(
            "max-w-2xl font-sans text-base leading-relaxed md:text-lg",
            onDark ? "text-white/70" : "text-muted-foreground",
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}

export function PartnersScreen({ footer }: { footer: React.ReactNode }) {
  const root = React.useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) return;

      // The hero plays on load. Everything below it plays on approach, so the
      // page arrives one thought at a time rather than all at once.
      gsap.from("[data-hero]", {
        y: 26,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.09,
      });
      gsap.from("[data-hero-art]", {
        y: 40,
        scale: 0.92,
        opacity: 0,
        duration: 0.9,
        delay: 0.15,
        ease: "power3.out",
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.from(element, {
          y: 24,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 88%" },
        });
      });

      // Cards rise together but not in lockstep, so a row reads left to right.
      gsap.utils.toArray<HTMLElement>("[data-reveal-group]").forEach((group) => {
        gsap.from(group.querySelectorAll("[data-reveal-item]"), {
          y: 28,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: { trigger: group, start: "top 82%" },
        });
      });

      // The steps column scrolls past a title that stays put, so the reader
      // never loses what the four steps are for.
      ScrollTrigger.matchMedia({
        "(min-width: 1024px)": () => {
          ScrollTrigger.create({
            trigger: "[data-steps-section]",
            start: "top 18%",
            end: "bottom 82%",
            pin: "[data-steps-title]",
            pinSpacing: false,
          });
        },
      });

      // Each step's number fills as it comes up, which is the whole progress
      // indicator the section needs.
      gsap.utils.toArray<HTMLElement>("[data-step]").forEach((step) => {
        gsap.to(step.querySelector("[data-step-index]"), {
          backgroundColor: "var(--primary)",
          color: "var(--primary-foreground)",
          borderColor: "var(--primary)",
          duration: 0.35,
          ease: "power2.out",
          scrollTrigger: { trigger: step, start: "top 72%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="w-full max-w-full overflow-x-hidden bg-background">
      <header className="relative overflow-hidden rounded-b-sheet pt-safe md:rounded-b-[3.5rem]">
        <Ambience />

        <div className="relative mx-auto w-full max-w-[1280px] px-4 pt-4 pb-14 md:px-8 md:pt-6 md:pb-20">
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
              <PortalLink
                variant="onDark"
                className="min-h-11 px-5 text-sm sm:min-h-12 sm:px-6 sm:text-base"
              >
                {COPY.openPortal}
              </PortalLink>
            </div>
          </nav>

          {/* Centred and full width, so the headline gets the whole 64rem and
              breaks on two lines rather than three. A narrower column here was
              the difference between a headline and a wall of text. */}
          <div className="mt-12 flex flex-col items-center gap-6 text-center md:mt-16">
            <h1
              data-hero
              className="max-w-5xl font-display text-[clamp(2.5rem,5.6vw,4.25rem)] leading-[1.04] font-extrabold text-balance text-white"
            >
              {COPY.headline}
            </h1>
            <p
              data-hero
              className="max-w-2xl font-sans text-lg leading-relaxed text-balance text-white/75 md:text-xl"
            >
              {COPY.subhead}
            </p>

            <div
              data-hero
              className="mt-1 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center"
            >
              <PortalLink variant="onDark" className="w-full sm:w-auto">
                {COPY.openPortal}
              </PortalLink>
              <a
                href="#how-it-works"
                className={cn(
                  "inline-flex min-h-14 items-center justify-center rounded-full border-[1.5px] border-white/35 px-8",
                  "font-sans text-base font-bold text-white",
                  "transition-colors hover:border-white/60 hover:bg-white/10",
                  pressableScale,
                  focusRing,
                )}
              >
                {COPY.seeHow}
              </a>
            </div>

            <p data-hero className="font-sans text-sm text-white/60">
              {COPY.heroNote}
            </p>

            <div
              data-hero-art
              className="relative w-full max-w-56 md:max-w-68"
            >
              <div
                aria-hidden
                className="absolute inset-x-8 top-12 bottom-4 rounded-[3rem] bg-white/5 blur-2xl"
              />
              <PartnerArtwork
                artKey="storefront"
                className="relative w-full drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="w-full">
        {/* What it takes to start. Three plain facts, because the first
            question a shop owner has is what this is going to cost them. */}
        <section className="mx-auto w-full max-w-[1280px] px-4 py-20 md:px-8 md:py-28">
          <SectionHeading title={COPY.factsTitle} />
          <div
            data-reveal-group
            className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3 md:gap-6"
          >
            {COPY.facts.map((fact) => (
              <div
                key={fact.title}
                data-reveal-item
                className={cn(
                  "group flex flex-col justify-center gap-2 rounded-card border border-border bg-card p-6",
                  "transition-[transform,box-shadow] duration-500 ease-out",
                  "hover:-translate-y-1 hover:shadow-e2",
                )}
              >
                <h3 className="font-display text-lg font-bold text-foreground">
                  {fact.title}
                </h3>
                <Text variant="body" className="text-muted-foreground">
                  {fact.body}
                </Text>
              </div>
            ))}
          </div>
        </section>

        {/* How it works. The title pins on desktop while the steps pass it. */}
        <section
          id="how-it-works"
          data-steps-section
          className="scroll-mt-24 border-y border-border bg-muted/40"
        >
          <div className="mx-auto grid w-full max-w-[1280px] gap-12 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div data-steps-title className="lg:h-fit">
              <SectionHeading
                title={COPY.howTitle}
                lead={COPY.howLead}
                align="start"
              />
              <div className="mt-8 hidden lg:block">
                <PartnerArtwork artKey="orders" className="w-44" />
              </div>
            </div>

            <ol className="flex flex-col">
              {COPY.steps.map((step, index) => (
                <li
                  key={step.title}
                  data-step
                  className="flex gap-5 border-b border-border py-7 last:border-b-0 md:gap-7 md:py-9"
                >
                  <span
                    data-step-index
                    aria-hidden
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-border",
                      "bg-card font-display text-lg font-extrabold text-muted-foreground",
                    )}
                  >
                    {index + 1}
                  </span>
                  <div className="flex flex-col gap-1.5 pt-1">
                    <h3 className="font-display text-xl font-bold text-foreground md:text-2xl">
                      {step.title}
                    </h3>
                    <Text variant="body" className="max-w-xl text-muted-foreground">
                      {step.body}
                    </Text>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* What you get. Four columns by three rows, filled exactly: the two
            wide cards and the two small ones interlock with no dead cell. */}
        <section className="mx-auto w-full max-w-[1280px] px-4 py-20 md:px-8 md:py-28">
          <SectionHeading title={COPY.getTitle} lead={COPY.getLead} />

          <div
            data-reveal-group
            className="mt-10 grid grid-flow-dense grid-cols-1 gap-4 md:mt-14 md:auto-rows-[minmax(11rem,auto)] md:grid-cols-4 md:gap-5"
          >
            <article
              data-reveal-item
              className={cn(
                "group relative flex flex-col justify-between overflow-hidden rounded-card p-7 md:col-span-2 md:row-span-2",
                "bg-linear-to-br from-(--hero-gradient-from) via-(--hero-gradient-via) to-(--hero-gradient-to)",
                "transition-transform duration-500 ease-out hover:-translate-y-1",
              )}
            >
              <div className="relative flex flex-col gap-2.5">
                <h3 className="max-w-xs font-display text-2xl leading-tight font-extrabold text-white md:text-3xl">
                  {COPY.features.orders.title}
                </h3>
                <p className="max-w-sm font-sans text-base leading-relaxed text-white/70">
                  {COPY.features.orders.body}
                </p>
              </div>
              <PartnerArtwork
                artKey="orders"
                className={cn(
                  "pointer-events-none mt-6 w-40 self-end md:w-52",
                  "transition-transform duration-700 ease-out group-hover:scale-105",
                )}
              />
            </article>

            <article
              data-reveal-item
              className={cn(
                "group flex flex-col justify-center gap-2 rounded-card border border-border bg-card p-7 md:col-span-2",
                "transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-e2",
              )}
            >
              <h3 className="font-display text-xl font-bold text-foreground">
                {COPY.features.pricing.title}
              </h3>
              <Text variant="body" className="text-muted-foreground">
                {COPY.features.pricing.body}
              </Text>
            </article>

            <article
              data-reveal-item
              className={cn(
                "group flex flex-col justify-center gap-2 rounded-card border border-border bg-card p-6",
                "transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-e2",
              )}
            >
              <h3 className="font-display text-lg font-bold text-foreground">
                {COPY.features.branches.title}
              </h3>
              <Text variant="body-small" className="text-muted-foreground">
                {COPY.features.branches.body}
              </Text>
            </article>

            <article
              data-reveal-item
              className={cn(
                "group flex flex-col justify-center gap-2 rounded-card border border-border bg-card p-6",
                "transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-e2",
              )}
            >
              <h3 className="font-display text-lg font-bold text-foreground">
                {COPY.features.staff.title}
              </h3>
              <Text variant="body-small" className="text-muted-foreground">
                {COPY.features.staff.body}
              </Text>
            </article>

            <article
              data-reveal-item
              className={cn(
                "group flex flex-col items-start gap-5 overflow-hidden rounded-card border border-border bg-card p-7 md:col-span-4 md:flex-row md:items-center md:justify-between md:gap-10",
                "transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-e2",
              )}
            >
              <div className="flex flex-col gap-2">
                <h3 className="max-w-lg font-display text-xl font-bold text-foreground md:text-2xl">
                  {COPY.features.money.title}
                </h3>
                <Text variant="body" className="max-w-2xl text-muted-foreground">
                  {COPY.features.money.body}
                </Text>
              </div>
              <PartnerArtwork
                artKey="wallet"
                className={cn(
                  "w-32 shrink-0 self-end md:w-40 md:self-auto",
                  "transition-transform duration-700 ease-out group-hover:scale-105",
                )}
              />
            </article>
          </div>
        </section>

        {/* What we hold ourselves to. Promises with a verb in them, so each one
            can be judged rather than admired. */}
        <section className="border-y border-border bg-muted/40">
          <div className="mx-auto w-full max-w-[1280px] px-4 py-20 md:px-8 md:py-28">
            <SectionHeading title={COPY.valuesTitle} />
            <div
              data-reveal-group
              className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3 md:gap-6"
            >
              {COPY.values.map((value) => (
                <div
                  key={value.title}
                  data-reveal-item
                  className={cn(
                    "flex flex-col gap-3 rounded-card border border-border bg-card p-7",
                    "transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-e2",
                  )}
                >
                  <span className="h-1 w-12 rounded-full bg-primary" aria-hidden />
                  <h3 className="font-display text-xl leading-snug font-bold text-foreground">
                    {value.title}
                  </h3>
                  <Text variant="body" className="text-muted-foreground">
                    {value.body}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Built for the shop you actually run. */}
        <section className="mx-auto w-full max-w-[1280px] px-4 py-20 md:px-8 md:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.8fr] lg:gap-20">
            <div className="flex flex-col gap-6">
              <SectionHeading title={COPY.simpleTitle} align="start" />
              <p
                data-reveal
                className="max-w-2xl font-sans text-base leading-relaxed text-muted-foreground md:text-lg"
              >
                {COPY.simpleBody}
              </p>
              <ul data-reveal-group className="flex flex-col gap-3">
                {COPY.simplePoints.map((point) => (
                  <li
                    key={point}
                    data-reveal-item
                    className="flex items-start gap-3"
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
                      {point}
                    </Text>
                  </li>
                ))}
              </ul>
            </div>

            <div data-reveal className="mx-auto w-full max-w-64 md:max-w-80">
              <PartnerArtwork artKey="growth" className="w-full" />
            </div>
          </div>
        </section>

        {/* Questions shop owners ask us. */}
        <section className="border-t border-border bg-muted/40">
          <div className="mx-auto w-full max-w-[52rem] px-4 py-20 md:px-8 md:py-28">
            <SectionHeading title={COPY.faqTitle} />
            <Accordion
              data-reveal
              type="single"
              collapsible
              className="mt-10 gap-0 md:mt-14"
            >
              {COPY.faq.map((entry) => (
                <AccordionItem
                  key={entry.question}
                  value={entry.question}
                  className="border-b border-border"
                >
                  <AccordionTrigger className="py-5 font-display text-base font-bold text-foreground hover:no-underline md:text-lg">
                    {entry.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5">
                    <p className="max-w-2xl font-sans text-base leading-relaxed text-muted-foreground">
                      {entry.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Put your shop online today. */}
        <section className="mx-auto w-full max-w-[1280px] px-4 pt-12 pb-20 md:px-8 md:pt-16 md:pb-28">
          <div className="relative overflow-hidden rounded-[2rem] px-6 py-16 md:rounded-[3rem] md:px-16 md:py-24">
            <Ambience />
            <div className="relative flex flex-col items-center gap-6 text-center">
              <PartnerArtwork
                artKey="handover"
                className="w-28 md:w-32"
              />
              <h2
                data-reveal
                className="max-w-3xl font-display text-[clamp(1.875rem,4vw,3.25rem)] leading-[1.08] font-extrabold text-white"
              >
                {COPY.closingTitle}
              </h2>
              <p
                data-reveal
                className="max-w-xl font-sans text-base leading-relaxed text-white/70 md:text-lg"
              >
                {COPY.closingBody}
              </p>
              <PortalLink variant="onDark" className="mt-2 w-full sm:w-auto">
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
