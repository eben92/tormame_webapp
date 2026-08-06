"use client";

import * as React from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  ART_HOVER,
  CategoryArtwork,
  type ArtPartTween,
} from "@/components/lobby/category-artwork";
import { categoryArt } from "@/lib/category-art";
import { cn, toTitleCase } from "@/lib/utils";

/**
 * A compact version of the lobby's category tile: same drawing, same wash, same
 * motion, one size down. Used where the verticals are navigation rather than the
 * main event, so the two pages read as one product.
 *
 * Deliberately calmer than the lobby tile — no idle drift and no arrow badge,
 * because a page whose real job is search shouldn't have eight things breathing
 * behind the results.
 */
export function CategoryCard({
  label,
  href,
  className,
}: {
  /** The API's category label; the drawing and wash are looked up from it. */
  label: string;
  href: string;
  className?: string;
}) {
  const art = categoryArt(label);
  const stage = React.useRef<HTMLSpanElement>(null);
  const hover = React.useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      hover.current = buildHoverTimeline(stage.current, ART_HOVER[art.artKey]);

      return () => {
        hover.current?.kill();
        hover.current = null;
      };
    },
    { scope: stage, dependencies: [art.artKey] },
  );

  const play = () => hover.current?.play();
  const reverse = () => hover.current?.reverse();

  return (
    <Link
      href={href}
      onPointerEnter={play}
      onPointerLeave={reverse}
      onPointerDown={play}
      onFocus={play}
      onBlur={reverse}
      className={cn(
        "group relative flex h-24 flex-col justify-end overflow-hidden p-3",
        "md:h-32 md:justify-center md:p-4",
        "rounded-card ring-1 ring-black/5 shadow-e1",
        art.tint,
        "outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
        className,
      )}
    >
      {/* Sized in fixed steps rather than a percentage of the card, so a card
          widened to close off a grid row keeps the drawing its neighbours have.
          It sits above the label on a phone and beside it once there's room. */}
      <span
        ref={stage}
        aria-hidden
        className={cn(
          "pointer-events-none absolute -top-1 right-1 size-16",
          "md:top-1/2 md:right-3 md:size-24 md:-translate-y-1/2",
        )}
      >
        <CategoryArtwork
          artKey={art.artKey}
          className="size-full overflow-visible drop-shadow-md"
        />
      </span>

      <span className="relative flex flex-col gap-0.5 md:pr-24">
        <span className="font-display text-sm leading-tight font-extrabold text-foreground md:text-base">
          {toTitleCase(label)}
        </span>
        {/* Only where it fits: on a phone the drawing already owns the space
            the blurb would need. */}
        {art.blurb ? (
          <span className="hidden font-sans text-xs leading-tight font-medium text-foreground/60 md:block">
            {art.blurb}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

/**
 * One paused timeline per card, played forward on hover/focus and reversed on
 * leave. Built once: rebuilding it on every pointer event would restart the
 * motion from wherever the last one stopped.
 *
 * Twin of the lobby tile's builder. Kept separate rather than shared, because
 * hoisting it would mean editing the landing page's grid for no gain here.
 */
function buildHoverTimeline(
  stage: HTMLElement | null,
  tweens: ArtPartTween[],
): gsap.core.Timeline | null {
  if (!stage) return null;

  const timeline = gsap.timeline({ paused: true });

  tweens.forEach(({ part, to, at }, index) => {
    const targets = stage.querySelectorAll(`[data-part="${part}"]`);
    if (targets.length === 0) return;

    timeline.to(
      targets,
      {
        duration: 0.45,
        ease: "back.out(1.8)",
        transformOrigin: "50% 50%",
        ...to,
      },
      at ?? index * 0.03,
    );
  });

  return timeline;
}
