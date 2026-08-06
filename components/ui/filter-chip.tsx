"use client";

import { cn } from "@/lib/utils";
import { focusRing, pressableScale } from "@/components/ui/pressable";

interface FilterChipProps extends React.ComponentProps<"button"> {
  label: string;
  isActive?: boolean;
  /**
   * 'default' — soft pill shared by the idle-chip surfaces (home/explore category rails,
   * explore trending tags, orders status tabs, checkout drop-off options).
   * 'tab' — stronger treatment for the shop-page category bar and the home category rail,
   * where the active tab has to read at a glance.
   */
  variant?: "default" | "tab";
}

export function FilterChip({
  label,
  isActive = false,
  variant = "default",
  className,
  ...props
}: FilterChipProps) {
  const isTab = variant === "tab";

  return (
    <button
      type="button"
      aria-pressed={isActive}
      className={cn(
        "inline-flex min-h-12 min-w-12 shrink-0 items-center justify-center rounded-full",
        pressableScale,
        focusRing,
        isTab ? "px-5 text-sm" : "px-4 text-xs",
        isTab
          ? isActive
            ? "bg-primary font-bold text-primary-foreground"
            : "border border-border bg-card text-body hover:bg-muted"
          : isActive
            ? "border border-primary/20 bg-primary-soft text-primary"
            : "bg-muted text-body hover:bg-secondary",
        className,
      )}
      {...props}
    >
      {label}
    </button>
  );
}
