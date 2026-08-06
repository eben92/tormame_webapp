"use client";

import type { LucideIcon } from "lucide-react";
import { CloudOff, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { classifyApiError, getErrorCopy } from "@/lib/api/errors";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  action?: { label: string; onClick: () => void };
  className?: string;
};

/** One sentence + one action. Friendly, never a dead end. */
export function EmptyState({
  icon: Icon,
  title,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-4 px-8 py-12",
        className,
      )}
    >
      <div className="flex size-20 items-center justify-center rounded-full bg-primary-soft">
        <Icon size={36} className="text-primary" aria-hidden />
      </div>
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
  const kind = classifyApiError(error);
  const copy = getErrorCopy(error);
  const Icon = kind === "offline" ? CloudOff : ServerCrash;

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-3 px-8 py-12",
        className,
      )}
    >
      <div className="flex size-20 items-center justify-center rounded-full bg-destructive/10">
        <Icon size={36} className="text-destructive" aria-hidden />
      </div>
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
