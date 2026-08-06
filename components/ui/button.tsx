import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Pill button, ported from the mobile `components/ui/button.tsx`: 48dp default
 * height, full radius, DM Sans bold, and the app-wide 120ms press-scale.
 */
const buttonVariants = cva(
  cn(
    "group/button relative inline-flex shrink-0 items-center justify-center gap-2 rounded-full",
    "font-sans text-base leading-5 font-bold whitespace-nowrap select-none",
    "transition-[background-color,color,transform,opacity] duration-(--duration-press)",
    "active:scale-[0.97] motion-reduce:active:scale-100",
    "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[18px]",
  ),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary-pressed",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/90 focus-visible:ring-destructive/40",
        outline:
          "border-[1.5px] border-border bg-card text-foreground hover:bg-muted active:bg-muted active:text-primary",
        secondary:
          "bg-secondary text-secondary-foreground shadow-e1 hover:bg-secondary/80 active:bg-secondary/80",
        ghost: "text-foreground hover:bg-muted active:bg-muted active:text-primary",
        link: "text-primary underline-offset-4 hover:underline active:underline",
      },
      size: {
        default: "h-12 px-4 py-2",
        sm: "h-11 gap-1.5 px-4 text-sm",
        lg: "h-14 px-8",
        icon: "size-12",
        "icon-sm": "size-9",
      },
      /** Half-opacity CTA that stays tappable so it can explain what is missing. */
      dimmed: {
        true: "opacity-50",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      dimmed: false,
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    isLoading?: boolean;
  };

function Button({
  className,
  variant = "default",
  size = "default",
  dimmed = false,
  asChild = false,
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, dimmed }), className)}
      disabled={disabled ?? (asChild ? undefined : isLoading)}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? <Loader2 className="animate-spin" aria-hidden /> : null}
      {children}
    </Comp>
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
