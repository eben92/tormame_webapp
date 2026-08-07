import Image from "next/image";
import Link from "next/link";
import { focusRing } from "@/components/ui/pressable";
import { cn } from "@/lib/utils";

/** Logo plus wordmark, linking home. */
export function BrandMark({
  href = "/home",
  className,
  size = 28,
}: {
  href?: string;
  className?: string;
  size?: number;
}) {
  return (
    <Link
      href={href}
      aria-label="TORMAME home"
      className={cn("flex items-center gap-2", focusRing, className)}
    >
      <Image
        src="/logo.png"
        alt=""
        width={size}
        height={size}
        className="rounded-lg"
      />
      <span className="font-sans text-base font-black tracking-widest text-foreground">
        TORMAME
      </span>
    </Link>
  );
}

/**
 * The wordmark, on its own row.
 *
 * The mobile app has no such bar — it doesn't need one, the customer installed
 * it and knows whose app it is. A website does: a page reached from a search
 * result or a shared link has to say whose it is. So the mobile layout is the
 * native screen with this above it, and nothing else changes.
 *
 * Pinned, at the same z-40 as the desktop header it stands in for, so the name
 * is still there once you have scrolled away from the top. It owns the top
 * safe-area inset, which is why the screens below it no longer apply their own
 * — and why it is sized by `--brand-bar-offset` (the bar plus that inset)
 * rather than a flat 3.5rem. Every other bar that pins itself to the top parks
 * at that same offset instead of at 0, so nothing has to know this height.
 */
export function BrandBar({
  href = "/home",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky top-0 z-40 flex h-(--brand-bar-offset) shrink-0 items-center border-b border-border bg-card px-4 pt-safe",
        className,
      )}
    >
      <BrandMark href={href} />
    </div>
  );
}
