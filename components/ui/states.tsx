"use client";

import {
  EmptyArtwork,
  type EmptyArtKey,
} from "@/components/shared/empty-artwork";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { classifyApiError, getErrorCopy } from "@/lib/api/errors";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  /** Which drawing — see the table on `EmptyArtKey`. */
  art: EmptyArtKey;
  title: string;
  action?: { label: string; onClick: () => void };
  className?: string;
};

/** One picture + one sentence + one action. Friendly, never a dead end. */
export function EmptyState({ art, title, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-4 px-8 py-12",
        className,
      )}
    >
      <EmptyArtwork artKey={art} className="size-36 md:size-40" />
      <Text variant="h3" className="text-center">
        {title}
      </Text>
      {action && (
        <Button size="lg" onClick={action.onClick} className="mt-2 min-w-56">
          {action.label}
        </Button>
      )}
    </div>
  );
}

type ErrorStateProps = {
  error: unknown;
  onRetry: () => void;
  className?: string;
};

/** Distinguishes "no internet" from "server problem". Always offers Retry. */
export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  const copy = getErrorCopy(error);
  // A dead network and a broken server are different apologies, so they get
  // different pictures; anything else is closer to a server problem than to a
  // missing connection.
  const art = classifyApiError(error) === "offline" ? "offline" : "server";

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-3 px-8 py-12",
        className,
      )}
    >
      <EmptyArtwork artKey={art} className="mb-1 size-36 md:size-40" />
      <Text variant="h3" className="text-center">
        {copy.title}
      </Text>
      <Text variant="body" className="text-center">
        {copy.message}
      </Text>
      <Button size="lg" onClick={onRetry} className="mt-3 min-w-56">
        {STRINGS.common.retry}
      </Button>
    </div>
  );
}

/** Building blocks for layout-mirroring loaders. Compose per screen — never a full-screen spinner. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-card border border-border bg-card p-4",
        className,
      )}
    >
      <Skeleton className="h-40 w-full rounded-image" />
      <Skeleton className="h-5 w-3/5" />
      <Skeleton className="h-4 w-2/5" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Skeleton className="size-16 rounded-image" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/5" />
      </div>
    </div>
  );
}

export function SkeletonHero() {
  return <Skeleton className="h-44 w-full rounded-card" />;
}
