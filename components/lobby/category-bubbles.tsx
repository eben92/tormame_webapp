"use client";

import * as React from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getCategoryIcon } from "@/lib/category-icons";
import { mergeCategoryOrder } from "@/lib/category-order";
import { toTitleCase } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useCategoryOrderStore } from "@/stores/category-order";

export interface CategoryBubbleItem {
  id: string;
  label: string;
}

interface CategoryBubblesProps {
  categories: CategoryBubbleItem[];
  onCategoryPress: (categoryId: string) => void;
}

/**
 * Circular category bubbles (icon + label, never icon-only), four per row on
 * mobile exactly as on the native lobby. Press-and-hold picks a bubble up and
 * dragging it over a neighbour swaps their slots; a plain click still navigates.
 * The chosen order persists locally and survives a reload.
 */
export function CategoryBubbles({
  categories,
  onCategoryPress,
}: CategoryBubblesProps) {
  const persistedOrder = useCategoryOrderStore((state) => state.order);
  const setPersistedOrder = useCategoryOrderStore((state) => state.setOrder);

  const byLabel = React.useMemo(
    () => new Map(categories.map((category) => [category.label, category])),
    [categories],
  );
  const apiLabels = React.useMemo(
    () => categories.map((category) => category.label),
    [categories],
  );
  // Derived, never mirrored into local state: the persisted order is the single
  // source of truth, reconciled against whatever verticals the API returns now.
  // Before hydration `persistedOrder` is empty, so this renders API order and
  // then re-derives once storage is read.
  const order = React.useMemo(
    () => mergeCategoryOrder(persistedOrder, apiLabels),
    [persistedOrder, apiLabels],
  );

  const sensors = useSensors(
    // 250ms hold before a drag starts, so a tap still navigates.
    useSensor(PointerSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = order.indexOf(String(active.id));
    const to = order.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    setPersistedOrder(arrayMove(order, from, to));
  };

  if (order.length === 0) return null;

  return (
    <div className="px-4 pt-7 pb-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={order} strategy={rectSortingStrategy}>
          <ul className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {order.map((label) => {
              const category = byLabel.get(label);
              if (!category) return null;
              return (
                <CategoryBubble
                  key={category.id}
                  id={label}
                  displayLabel={toTitleCase(category.label)}
                  onPress={() => onCategoryPress(category.id)}
                />
              );
            })}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function CategoryBubble({
  id,
  displayLabel,
  onPress,
}: {
  id: string;
  displayLabel: string;
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

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex touch-none justify-center", isDragging && "z-10")}
    >
      <button
        type="button"
        onClick={onPress}
        className={cn(
          "flex h-[148px] w-full flex-col items-center justify-center gap-1.5 px-1",
          "rounded-card outline-none focus-visible:ring-[3px] focus-visible:ring-white/60",
          "transition-transform duration-(--duration-press) active:scale-[0.97] motion-reduce:active:scale-100",
          isDragging && "scale-[1.06] cursor-grabbing",
        )}
        {...attributes}
        {...listeners}
      >
        <span className="flex size-[68px] items-center justify-center rounded-full bg-primary-soft">
          {React.createElement(getCategoryIcon(id), {
            size: 26,
            className: "text-primary",
            "aria-hidden": true,
          })}
        </span>
        {/* The native bubble shrinks a long label to keep it on one line rather than
            hyphenating mid-word ("Entertainm/ent"), which reads badly. CSS has no
            auto-shrink, so the size steps down by label length to the same effect. */}
        <span
          className={cn(
            "w-full text-center font-sans font-bold text-white",
            displayLabel.length > 13
              ? "text-[10px]"
              : displayLabel.length > 9
                ? "text-xs"
                : "text-sm",
          )}
        >
          {displayLabel}
        </span>
      </button>
    </li>
  );
}
