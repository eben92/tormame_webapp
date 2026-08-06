import { Skeleton } from "@/components/ui/skeleton";

/**
 * Prerendered shells. With Partial Prerendering each route ships these as
 * static HTML before any JavaScript runs, and the real content replaces them as
 * it streams in — so they exist to hold the right shape, not to entertain.
 * Server components on purpose: nothing here may need the client bundle.
 */

function CardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-[120px] w-full rounded-image" />
      <Skeleton className="h-4 w-3/5" />
      <Skeleton className="h-3 w-2/5" />
    </div>
  );
}

/** Holds a rail of `FilterChip`s — explore and the shop page's category bar. */
function ChipRailSkeleton() {
  return (
    <div className="flex gap-2 overflow-hidden px-4 md:px-0">
      {[0, 1, 2, 3, 4].map((index) => (
        <Skeleton key={index} className="h-12 w-24 shrink-0 rounded-full" />
      ))}
    </div>
  );
}

/** Home's rail is taller: every chip carries the lobby's category artwork. */
function CategoryRailSkeleton() {
  return (
    <div className="flex gap-2 overflow-hidden px-4 py-1">
      {[0, 1, 2, 3, 4].map((index) => (
        <Skeleton key={index} className="h-14.5 w-28 shrink-0 rounded-full" />
      ))}
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-3 pb-2 md:hidden">
        <div className="px-4 pt-3">
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="mx-4 h-12 rounded-full" />
      </div>

      {/* Same single mount and same gutters as `HomeScreen`, or the rail moves
          when the real one replaces this. */}
      <div className="pb-2 md:pt-5 md:pb-1">
        <div className="mx-auto w-full max-w-[1280px] md:px-4">
          <CategoryRailSkeleton />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 pt-3 md:px-8 md:pt-6">
        <Skeleton className="h-[150px] w-full rounded-card" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CollectionSkeleton() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-3 px-4 pt-3 pb-3 md:px-8">
        <Skeleton className="size-12 rounded-full" />
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-3 px-4 md:grid-cols-2 md:px-8 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export function ExploreSkeleton() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-3 px-4 pt-3 pb-3 md:px-8">
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
      <ChipRailSkeleton />
      <div className="mx-auto mt-4 grid w-full max-w-[1280px] grid-cols-1 gap-3 px-4 md:grid-cols-2 md:px-8 lg:grid-cols-3">
        {[0, 1, 2, 3].map((index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export function ShopSkeleton() {
  return (
    <div className="flex flex-1 flex-col">
      <Skeleton className="h-56 w-full rounded-none md:rounded-card" />
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 px-4 pt-4 md:px-8">
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <ChipRailSkeleton />
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="flex gap-3">
              <Skeleton className="size-20 shrink-0 rounded-image" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-3 w-3/5" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * The lobby is a full-bleed brand screen; its shell keeps the canvas. Painted
 * from the same `--hero-*` tokens as `Ambience`, not from `--primary`, which
 * inverts to a mint the real hero never shows — the landing page flashed it.
 */
export function LobbySkeleton() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="relative overflow-hidden rounded-b-sheet px-4 pt-safe pb-7">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-br from-(--hero-gradient-from) via-(--hero-gradient-via) to-(--hero-gradient-to)" />
          <div className="absolute -top-24 -left-20 size-72 rounded-full bg-(--hero-glow-cool) blur-3xl" />
          <div className="absolute -right-24 -bottom-28 size-80 rounded-full bg-(--hero-glow-warm) blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-3">
          <div className="flex items-center justify-between pt-4">
            <Skeleton className="h-8 w-40 bg-white/20" />
            <Skeleton className="h-8 w-20 rounded-full bg-white/20" />
          </div>
          <Skeleton className="mt-2 h-6 w-32 rounded-full bg-white/20" />
          <Skeleton className="h-10 w-3/4 bg-white/20" />
          <Skeleton className="h-4 w-1/2 bg-white/20" />
          <Skeleton className="mt-1 h-12 w-full rounded-full bg-white/20" />
        </div>
      </div>
      <div className="flex flex-col gap-2 px-4 pt-6">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 px-4">
        <Skeleton className="col-span-2 h-35 rounded-card" />
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-35 rounded-card" />
        ))}
      </div>
    </div>
  );
}

export function OrderDetailsSkeleton() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-border px-4 pt-3 pb-3 md:px-8">
        <Skeleton className="size-12 rounded-full" />
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="mx-auto flex w-full max-w-[52rem] flex-col gap-5 px-4 py-4 md:px-8">
        <Skeleton className="h-28 w-full rounded-card" />
        <Skeleton className="h-40 w-full rounded-card" />
        <Skeleton className="h-32 w-full rounded-card" />
      </div>
    </div>
  );
}

export function OnboardingSkeleton() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[30rem] flex-col gap-4 px-4 pt-safe">
      <Skeleton className="mt-8 h-8 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="mt-4 h-12 w-full rounded-full" />
      <div className="flex flex-col gap-2">
        {[0, 1, 2, 3, 4].map((index) => (
          <Skeleton key={index} className="h-14 w-full rounded-card" />
        ))}
      </div>
    </div>
  );
}
