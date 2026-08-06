import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * The app's type scale, ported 1:1 from the mobile `components/ui/text.tsx`.
 * Sizes and line heights are intentionally fixed (not responsive): the mobile
 * viewport must read identically to the native app, and desktop keeps the same
 * scale so the two never drift.
 */
const textVariants = cva("", {
  variants: {
    variant: {
      display:
        "font-display text-[2rem] leading-[2.375rem] font-extrabold text-foreground",
      h1: "font-display text-[1.625rem] leading-8 font-bold text-foreground",
      h2: "font-display text-[1.375rem] leading-7 font-bold text-foreground",
      h3: "font-display text-lg leading-6 font-semibold text-foreground",
      body: "font-sans text-base leading-6 text-body",
      "body-strong": "font-sans text-base leading-6 font-bold text-foreground",
      "body-small": "font-sans text-sm leading-5 text-body",
      caption:
        "font-sans text-xs font-medium tracking-[0.06em] uppercase text-muted-foreground",
      button: "font-sans text-base leading-5 font-bold",
    },
  },
  defaultVariants: { variant: "body" },
});

type TextVariant = NonNullable<VariantProps<typeof textVariants>["variant"]>;

const VARIANT_ELEMENT: Record<TextVariant, React.ElementType> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  body: "p",
  "body-strong": "p",
  "body-small": "p",
  caption: "p",
  button: "span",
};

type TextProps = React.ComponentPropsWithoutRef<"p"> &
  VariantProps<typeof textVariants> & {
    asChild?: boolean;
    /** Overrides the element the variant would render, e.g. a `display` heading used as a label. */
    as?: React.ElementType;
  };

export function Text({
  className,
  variant = "body",
  asChild = false,
  as,
  ...props
}: TextProps) {
  const Component = asChild
    ? Slot.Root
    : (as ?? VARIANT_ELEMENT[variant ?? "body"]);

  return (
    <Component
      className={cn(textVariants({ variant }), className)}
      {...props}
    />
  );
}

export { textVariants };
