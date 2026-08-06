import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      rounded: [{ rounded: ["card", "image", "sheet"] }],
      "rounded-t": [{ "rounded-t": ["card", "image", "sheet"] }],
      "font-family": [{ font: ["display", "heading", "sans"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}

export function formatCedis(amount: number): string {
  return `GH₵${amount.toFixed(2)}`;
}

/**
 * Label for a store's delivery fee.
 * - resolved 0 (free for the customer's city) -> "Free"
 * - resolved > 0 -> the exact fee
 * - no resolved fee (no location context): "from {min}", or "Free" if min is 0/absent
 */
export function deliveryFeeLabel(opts: {
  resolved?: number | null;
  min?: number | null;
}): string {
  const { resolved, min } = opts;
  if (resolved != null) {
    return resolved <= 0 ? "Free" : formatCedis(resolved);
  }
  if (min != null && min > 0) {
    return `from ${formatCedis(min)}`;
  }
  return "Free";
}

/** Category labels come from the API as raw verticals (e.g. "FOOD") — Title Case for display only. */
export function toTitleCase(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

/** Initials for the profile avatar fallback. */
export function initialsFromName(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
