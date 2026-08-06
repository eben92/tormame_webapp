"use client";

import * as React from "react";
import Image from "next/image";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowUpRight } from "lucide-react";
import { categoryArt } from "@/lib/category-art";
import {
  mergeCategoryOrder,
  sortCategoriesByDefault,
} from "@/lib/category-order";
import { cn, toTitleCase } from "@/lib/utils";
import { useCategoryOrderStore } from "@/stores/category-order";

export interface CategoryTileItem {
  id: string;
  label: string;
}

/**
 * The lobby's service grid: one wide tile at the top for whatever the customer
 * put first, then a two-up grid of the rest. Each tile is a picture of the
 * goods on its own wash, because the lobby has to read as a shop front rather
 * than a menu.
 *
 * The order is the customer's and persists locally — press and hold a tile to
 * move it. A plain tap still opens the category, so the two never fight on a
 * touchscreen.
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
  const persistedOrder = useCategoryOrderStore((state) => state.order);
  const setPersistedOrder = useCategoryOrderStore((state) => state.setOrder);
  const grid = React.useRef<HTMLDivElement>(null);

  const byLabel = React.useMemo(
    () => new Map(categories.map((category) => [category.label, category])),
    [categories],
  );
  const apiLabels = React.useMemo(
    () => sortCategoriesByDefault(categories.map((category) => category.label)),
    [categories],
  );
  // Derived, never mirrored into local state: the persisted order is the single
  // source of truth, reconciled against whatever verticals the API returns now.
  const order = React.useMemo(
    () => mergeCategoryOrder(persistedOrder, apiLabels),
    [persistedOrder, apiLabels],
  );

  const sensors = useSensors(
    // A short hold before a drag begins, so a tap still navigates.
    useSensor(PointerSensor, {
      activationConstraint: { delay: 220, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) return;

      gsap.from("[data-tile]", {
        y: 22,
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.045,
      });
    },
    { scope: grid, dependencies: [order.length] },
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const from = order.indexOf(String(active.id));
    const to = order.indexOf(String(over.id));
    if (from === -1 || to === -1) return;

    const next = [...order];
    next.splice(to, 0, ...next.splice(from, 1));
    setPersistedOrder(next);
  };

  if (order.length === 0) return null;

  return (
    <DndContext
      // Fixed, because dnd-kit derives its screen-reader `aria-describedby`
      // ids from it — letting it auto-generate hydrates a different id than
      // the server rendered.
      id="lobby-categories"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={order} strategy={rectSortingStrategy}>
        <div
          ref={grid}
          className={cn(
            "grid grid-flow-dense grid-cols-2 gap-3 [grid-auto-rows:8.75rem]",
            "md:grid-cols-4 md:gap-4 md:[grid-auto-rows:11rem]",
            className,
          )}
        >
          {order.map((label, index) => {
            const category = byLabel.get(label);
            if (!category) return null;

            return (
              <Tile
                key={category.id}
                id={label}
                displayLabel={toTitleCase(category.label)}
                isFeatured={index === 0}
                isWide={index === 1}
                onPress={() => onCategoryPress(category.id)}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function Tile({
  id,
  displayLabel,
  isFeatured,
  isWide,
  onPress,
}: {
  id: string;
  displayLabel: string;
  isFeatured: boolean;
  /** Second in the order: runs two columns wide, which squares the grid off. */
  isWide: boolean;
  onPress: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const art = categoryArt(id);

  return (
    <div
      ref={setNodeRef}
      data-tile
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "touch-none",
        // The featured tile runs the full width of the phone grid and takes a
        // square block of the desktop one; the runner-up widens on desktop
        // only, where it fills the row the featured block leaves ragged.
        isFeatured && "col-span-2 md:row-span-2",
        isWide && "md:col-span-2",
        isDragging ? "z-20 opacity-90" : "z-0",
      )}
    >
      <button
        type="button"
        onClick={onPress}
        className={cn(
          "group relative flex size-full flex-col justify-between overflow-hidden p-4 text-left",
          "rounded-card ring-1 ring-black/5 shadow-e1",
          art.tint,
          "outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
          "transition-[transform,box-shadow] duration-(--duration-base)",
          "hover:-translate-y-1 hover:shadow-e2 active:scale-[0.98]",
          "motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100",
          isDragging && "scale-[1.03] cursor-grabbing shadow-e3",
        )}
        {...attributes}
        {...listeners}
      >
        {/* Sits behind the copy and is allowed to run off two edges, so the
            tile reads as a photographed corner of a shop rather than an icon
            centred in a box. */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute -right-[6%] -bottom-[8%] aspect-square",
            "transition-transform duration-(--duration-base) group-hover:scale-105",
            "motion-reduce:group-hover:scale-100",
            isFeatured
              ? "w-[34%] md:w-[38%]"
              : isWide
                ? "w-[52%] md:w-[28%]"
                : "w-[52%]",
          )}
        >
          <Image
            src={art.src}
            alt=""
            fill
            unoptimized
            // The featured tile's art is the page's largest paint. The rest are
            // above the fold too — and a saved order can promote any of them to
            // the featured slot after hydration — so none of them lazy-load.
            priority={isFeatured}
            loading={isFeatured ? undefined : "eager"}
            sizes="(min-width: 768px) 12rem, 6rem"
            className="object-contain drop-shadow-[0_6px_10px_rgb(0_0_0/0.16)]"
          />
        </span>

        <span
          className={cn(
            "relative flex flex-col gap-0.5",
            isFeatured ? "pr-[36%] md:pr-[46%]" : "pr-[46%]",
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
