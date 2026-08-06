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
      aria-label="TORMAME — home"
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
 * Deliberately not sticky: several screens already pin their own bars to the
 * top of the viewport (the shop's category rail, for one), and a second sticky
 * layer would either cover them or force every one of them to know this bar's
 * height. It also owns the top safe-area inset, which is why the screens below
 * it no longer apply their own.
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
        "flex h-14 shrink-0 items-center border-b border-border bg-card px-4 pt-safe",
        className,
      )}
    >
      <BrandMark href={href} />
    </div>
  );
}
