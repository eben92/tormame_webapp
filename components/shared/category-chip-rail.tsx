"use client";

import * as React from "react";
import { FilterChip } from "@/components/ui/filter-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { STRINGS } from "@/lib/strings";
import { toTitleCase } from "@/lib/utils";

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
 */
export function CategoryChipRail({
  categories,
  activeCategoryId,
  isLoading = false,
  onSelectAll,
  onSelectCategory,
}: CategoryChipRailProps) {
  const activeRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeCategoryId]);

  return (
    <div className="scrollbar-none flex gap-2 overflow-x-auto px-4">
      <div ref={activeCategoryId ? undefined : activeRef}>
        <FilterChip
          variant="tab"
          label={STRINGS.category.all}
          isActive={!activeCategoryId}
          onClick={onSelectAll}
        />
      </div>
      {isLoading ? (
        <>
          <Skeleton className="h-10 w-20 shrink-0 rounded-full" />
          <Skeleton className="h-10 w-20 shrink-0 rounded-full" />
          <Skeleton className="h-10 w-20 shrink-0 rounded-full" />
        </>
      ) : (
        categories.map((category) => (
          <div
            key={category.id}
            ref={category.id === activeCategoryId ? activeRef : undefined}
          >
            <FilterChip
              variant="tab"
              label={toTitleCase(category.label)}
              isActive={category.id === activeCategoryId}
              onClick={() => onSelectCategory(category.id)}
            />
          </div>
        ))
      )}
    </div>
  );
}
