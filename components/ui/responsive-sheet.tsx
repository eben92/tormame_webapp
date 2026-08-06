"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsDesktop } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

type ResponsiveSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Hides the title visually while keeping it for screen readers. */
  hideTitle?: boolean;
  children: React.ReactNode;
  className?: string;
  /**
   * The element that opens the sheet. Passing it here (rather than wiring an
   * onClick) lets the primitive own focus: without it the trigger keeps focus
   * inside the aria-hidden background while the sheet is open.
   */
  trigger?: React.ReactNode;
};

/**
 * The app's one overlay surface: a bottom sheet on mobile (matching the native
 * `@gorhom/bottom-sheet` screens) and a centred dialog on desktop, where a
 * sheet sliding off the bottom of a 1400px window reads as a mistake.
 */
export function ResponsiveSheet({
  open,
  onOpenChange,
  title,
  description,
  hideTitle = false,
  children,
  className,
  trigger,
}: ResponsiveSheetProps) {
  const isDesktop = useIsDesktop();

  // Cache Components keeps a route mounted (hidden) when you navigate away, so
  // without this an open sheet would still be open on the way back. A sheet is
  // a transient interaction, not view state worth restoring.
  const closeRef = React.useRef(onOpenChange);
  React.useEffect(() => {
    closeRef.current = onOpenChange;
  }, [onOpenChange]);
  React.useLayoutEffect(() => () => closeRef.current(false), []);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
        <DialogContent className={cn("max-h-[85vh] overflow-y-auto", className)}>
          <DialogHeader>
            <DialogTitle className={cn(hideTitle && "sr-only")}>
              {title}
            </DialogTitle>
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : null}
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    /* autoFocus moves focus into the sheet on open; without it the trigger keeps
       focus while vaul aria-hides the page behind it. */
    <Drawer open={open} onOpenChange={onOpenChange} autoFocus>
      {trigger ? <DrawerTrigger asChild>{trigger}</DrawerTrigger> : null}
      <DrawerContent className={className}>
        <DrawerHeader>
          <DrawerTitle className={cn(hideTitle && "sr-only")}>
            {title}
          </DrawerTitle>
          {description ? (
            <DrawerDescription>{description}</DrawerDescription>
          ) : null}
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto pb-safe">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
