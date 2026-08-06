"use client";

import * as React from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowUpRight } from "lucide-react";
import {
  ART_HOVER,
  CategoryArtwork,
  type ArtPartTween,
} from "@/components/lobby/category-artwork";
import { categoryArt } from "@/lib/category-art";
import { sortCategoriesByDefault } from "@/lib/category-order";
import { cn, toTitleCase } from "@/lib/utils";

export interface CategoryTileItem {
  id: string;
  label: string;
}

/**
 * The lobby's service grid: Food first and largest, the rest two-up beneath it.
 * Each tile is a picture of the goods on its own wash, because the lobby has to
 * read as a shop front rather than a menu.
 *
 * The order is fixed (see `sortCategoriesByDefault`) — the tiles are landmarks
 * on the landing page, and a customer who rearranged them would find the page
 * different from every screenshot, advert and support answer about it.
 */
export function CategoryTiles({
  categories,
  onCategoryPress,
  className,
}: {
  categories: CategoryTileItem[];
  onCategoryPress: (categoryId: string) => void;
  className?: string;
}) {
  const grid = React.useRef<HTMLDivElement>(null);

  const ordered = React.useMemo(() => {
    const byLabel = new Map(
      categories.map((category) => [category.label, category]),
    );
    return sortCategoriesByDefault(categories.map((entry) => entry.label))
      .map((label) => byLabel.get(label))
      .filter((category): category is CategoryTileItem => Boolean(category));
  }, [categories]);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.from("[data-tile]", {
        y: 22,
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.045,
      });
    },
    { scope: grid, dependencies: [ordered.length] },
  );

  if (ordered.length === 0) return null;

  return (
    <div
      ref={grid}
      className={cn(
        "grid grid-flow-dense grid-cols-2 auto-rows-35 gap-3",
        "md:grid-cols-4 md:auto-rows-44 md:gap-4",
        className,
      )}
    >
      {ordered.map((category, index) => (
        <Tile
          key={category.id}
          label={category.label}
          displayLabel={toTitleCase(category.label)}
          isFeatured={index === 0}
          isWide={index === 1}
          onPress={() => onCategoryPress(category.id)}
        />
      ))}
    </div>
  );
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Tile({
  label,
  displayLabel,
  isFeatured,
  isWide,
  onPress,
}: {
  label: string;
  displayLabel: string;
  isFeatured: boolean;
  /** Second in the order: runs two columns wide, which squares the grid off. */
  isWide: boolean;
  onPress: () => void;
}) {
  const art = categoryArt(label);
  const stage = React.useRef<HTMLSpanElement>(null);
  const hover = React.useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      // The drawing breathes on its own, so the grid is alive before anyone
      // touches it — each tile on its own clock, or the page pulses in unison
      // and reads as a loading state.
      gsap.to(stage.current, {
        y: -5,
        duration: 2.6 + Math.random() * 0.8,
        delay: Math.random() * 0.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

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
    <div
      data-tile
      className={cn(
        // The featured tile runs the full width of the phone grid and takes a
        // square block of the desktop one; the runner-up widens on desktop
        // only, where it fills the row the featured block leaves ragged.
        isFeatured && "col-span-2 md:row-span-2",
        isWide && "md:col-span-2",
      )}
    >
      <button
        type="button"
        onClick={onPress}
        onPointerEnter={play}
        onPointerLeave={reverse}
        onPointerDown={play}
        onFocus={play}
        onBlur={reverse}
        className={cn(
          "group relative flex size-full flex-col justify-between overflow-hidden p-4 text-left",
          "rounded-card ring-1 ring-black/5 shadow-e1",
          art.tint,
          "outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
        )}
      >
        {/* Sits behind the copy and runs off two edges, so the tile reads as a
            corner of a shop rather than an icon centred in a box. */}
        <span
          ref={stage}
          aria-hidden
          className={cn(
            "pointer-events-none absolute right-[-6%] bottom-[-8%] aspect-square",
            // The featured tile is a two-by-two block on desktop, so its
            // drawing is sized against that, not against the small tiles —
            // at the others' share it left the block reading as empty.
            isFeatured
              ? "w-[34%] md:w-[50%]"
              : isWide
                ? "w-[52%] md:w-[28%]"
                : "w-[52%]",
          )}
        >
          <CategoryArtwork
            artKey={art.artKey}
            className="size-full overflow-visible drop-shadow-[0_6px_10px_rgb(0_0_0/0.16)]"
          />
        </span>

        <span
          className={cn(
            "relative flex flex-col gap-0.5",
            isFeatured ? "pr-[36%] md:pr-[52%]" : "pr-[46%]",
          )}
        >
          <span
            className={cn(
              "font-display leading-tight font-extrabold text-foreground",
              isFeatured ? "text-xl md:text-2xl" : "text-base",
            )}
          >
            {displayLabel}
          </span>
          {art.blurb ? (
            <span className="font-sans text-[11px] leading-tight font-medium text-foreground/60 md:text-xs">
              {art.blurb}
            </span>
          ) : null}
        </span>

        {/* The affordance: every tile carries a visible control, so nothing on
            this page has to be guessed at. */}
        <span
          aria-hidden
          className={cn(
            "relative inline-flex size-8 items-center justify-center rounded-full",
            "bg-card/80 text-foreground shadow-e1",
            "transition-transform duration-(--duration-base) group-hover:translate-x-0.5",
            "motion-reduce:group-hover:translate-x-0",
          )}
        >
          <ArrowUpRight size={16} />
        </span>
      </button>
    </div>
  );
}

/**
 * One paused timeline per tile, played forward on hover/focus and reversed on
 * leave. Built once: rebuilding it on every pointer event would restart the
 * motion from wherever the last one stopped.
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
