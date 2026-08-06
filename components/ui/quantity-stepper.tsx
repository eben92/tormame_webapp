"use client";

import { Minus, Plus } from "lucide-react";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";
import { focusRing, pressableScale } from "@/components/ui/pressable";

type QuantityStepperProps = {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  /** − disables once quantity reaches this floor (default 1 — a basket line can't go to 0 here). */
  min?: number;
  /** + disables once quantity reaches this ceiling (e.g. remaining stock). Omit for no ceiling. */
  max?: number;
  className?: string;
  /**
   * When `min === 0` and `quantity === 1`, pressing "−" removes the line entirely. Pass a
   * label here so screen readers announce the destructive action at that boundary.
   */
  decrementAtBoundaryLabel?: string;
};

/**
 * Pill quantity control used wherever a quantity is adjusted (variant sheet, basket lines).
 * Both buttons are 48×48 and disable — never hide — at the bounds, so the control never
 * changes size. Ported from mobile `components/ui/numbers.tsx`.
 */
export function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  min = 1,
  max,
  className,
  decrementAtBoundaryLabel,
}: QuantityStepperProps) {
  const atMin = quantity <= min;
  const atMax = max != null && quantity >= max;
  const isRemovalBoundary = min === 0 && quantity === 1;
  const decrementLabel =
    isRemovalBoundary && decrementAtBoundaryLabel
      ? decrementAtBoundaryLabel
      : STRINGS.product.decreaseQuantity;

  const buttonClass = cn(
    "flex size-12 items-center justify-center rounded-full bg-card text-foreground",
    pressableScale,
    focusRing,
    "disabled:pointer-events-none disabled:opacity-40",
  );

  return (
    <div
      className={cn(
        "flex w-fit shrink-0 items-center gap-2 rounded-full bg-muted p-1",
        className,
      )}
    >
      <button
        type="button"
        onClick={onDecrement}
        disabled={atMin}
        aria-label={decrementLabel}
        className={buttonClass}
      >
        <Minus size={18} strokeWidth={2.5} />
      </button>

      <span
        className="min-w-6 text-center font-sans text-base font-bold text-foreground"
        aria-label={STRINGS.product.quantityLabel(quantity)}
      >
        {quantity}
      </span>

      <button
        type="button"
        onClick={onIncrement}
        disabled={atMax}
        aria-label={STRINGS.product.increaseQuantity}
        className={buttonClass}
      >
        <Plus size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}
