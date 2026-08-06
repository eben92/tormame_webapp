"use client";

import * as React from "react";
import { LayoutGrid } from "lucide-react";
import { CategoryArtwork } from "@/components/lobby/category-artwork";
import { Skeleton } from "@/components/ui/skeleton";
import { focusRing, pressableScale } from "@/components/ui/pressable";
import { categoryArt } from "@/lib/category-art";
import { sortCategoriesByDefault } from "@/lib/category-order";
import { STRINGS } from "@/lib/strings";
import { cn, toTitleCase } from "@/lib/utils";

type Category = { id: string; label: string };

type CategoryChipRailProps = {
  categories: Category[];
  activeCategoryId?: string;
  isLoading?: boolean;
  onSelectAll: () => void;
  onSelectCategory: (id: string) => void;
};

/**
 * Horizontal category rail that keeps the active chip in view. Mounted in every
 * screen state so it never unmounts when the content below swaps.
 *
 * Each chip carries the same drawing the lobby tiles use, on the same wash, so
 * a customer arriving from the landing page recognises the vertical by its
 * picture rather than by re-reading the word. At rail size the drawing is too
 * small to stand on the page unaided, so it sits on a tinted plate.
 */
export function CategoryChipRail({
  categories,
  activeCategoryId,
  isLoading = false,
  onSelectAll,
  onSelectCategory,
}: CategoryChipRailProps) {
  const activeRef = React.useRef<HTMLButtonElement>(null);

  // Matches the lobby's ranking — Food leads both surfaces, so the rail is not
  // a differently-ordered copy of the page the customer just came from.
  const ordered = React.useMemo(() => {
    const byLabel = new Map(categories.map((entry) => [entry.label, entry]));
    return sortCategoriesByDefault(categories.map((entry) => entry.label))
      .map((label) => byLabel.get(label))
      .filter((entry): entry is Category => Boolean(entry));
  }, [categories]);

  React.useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "nearest",
      inline: "center",
    });
    // `ordered` is a dependency because on a deep link the chips arrive after
    // the first paint, and the ref has nothing to scroll until they do.
  }, [activeCategoryId, ordered]);

  return (
    // `py-1` is the focus ring's room: `overflow-x-auto` clips vertically too,
    // and the ring is drawn outside the chip's border box.
    <div className="scrollbar-none flex gap-2 overflow-x-auto px-4 py-1">
      <CategoryChip
        ref={activeCategoryId ? undefined : activeRef}
        label={STRINGS.category.all}
        isActive={!activeCategoryId}
        onClick={onSelectAll}
      >
        <LayoutGrid className="size-4.5 text-foreground/70" aria-hidden />
      </CategoryChip>

      {isLoading ? (
        <>
          <CategoryChipSkeleton className="w-24" />
          <CategoryChipSkeleton className="w-32" />
          <CategoryChipSkeleton className="w-28" />
        </>
      ) : (
        ordered.map((category) => (
          <CategoryChipWithArt
            key={category.id}
            ref={category.id === activeCategoryId ? activeRef : undefined}
            label={category.label}
            isActive={category.id === activeCategoryId}
            onClick={() => onSelectCategory(category.id)}
          />
        ))
      )}
    </div>
  );
}

function CategoryChipWithArt({
  ref,
  label,
  isActive,
  onClick,
}: {
  ref?: React.Ref<HTMLButtonElement>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const art = categoryArt(label);

  return (
    <CategoryChip
      ref={ref}
      label={toTitleCase(label)}
      isActive={isActive}
      onClick={onClick}
      plateClassName={art.tint}
    >
      <CategoryArtwork
        artKey={art.artKey}
        className="size-9 overflow-visible drop-shadow-sm"
      />
    </CategoryChip>
  );
}

/**
 * The rail's only chip shape. It is a filter a customer taps over and over, so
 * the response is a CSS scale — the lobby's part-level GSAP timelines are
 * illegible at 40px, and one paused timeline per vertical would have to be
 * rebuilt every time the category list settles.
 */
function CategoryChip({
  ref,
  label,
  isActive,
  onClick,
  plateClassName,
  children,
}: {
  ref?: React.Ref<HTMLButtonElement>;
  label: string;
  isActive: boolean;
  onClick: () => void;
  plateClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      className={cn(
        "group inline-flex shrink-0 items-center gap-2 rounded-full border py-1.5 pr-4 pl-1.5",
        "font-sans text-sm font-semibold",
        pressableScale,
        focusRing,
        isActive
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-body hover:bg-muted",
      )}
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-full",
          "transition-transform duration-(--duration-base) group-hover:scale-105",
          "motion-reduce:transition-none motion-reduce:group-hover:scale-100",
          plateClassName ?? "bg-tile-neutral",
        )}
      >
        {children}
      </span>
      {label}
    </button>
  );
}

/**
 * Same footprint as a real chip — 1.5 units of padding either side of a plate
 * 10 units tall, plus the chip's own border — so the rail does not shift by a
 * pixel when the categories land.
 */
function CategoryChipSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-13 shrink-0 rounded-full", className)} />;
}
