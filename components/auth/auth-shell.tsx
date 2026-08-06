"use client";

import * as React from "react";
import { ArrowLeft, X } from "lucide-react";
import { Text } from "@/components/ui/text";
import { focusRing, pressableScale } from "@/components/ui/pressable";
import { getErrorCopy } from "@/lib/api/errors";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  title: string;
  subtitle: string;
  /** `close` shows an X on the right (sign-in); `back` shows an arrow on the left. */
  dismiss: { kind: "close" | "back"; onDismiss: () => void };
  error?: unknown;
  children: React.ReactNode;
  /** Sticky CTA area — pinned to the bottom on mobile, in-flow on desktop. */
  footer: React.ReactNode;
};

/**
 * Shared chrome for every auth screen: full-bleed column with a sticky footer on
 * mobile (matching the native `KeyboardStickyView` layout), a centred card on
 * desktop.
 */
export function AuthShell({
  title,
  subtitle,
  dismiss,
  error,
  children,
  footer,
}: AuthShellProps) {
  const DismissIcon = dismiss.kind === "close" ? X : ArrowLeft;

  return (
    <div className="flex min-h-dvh flex-col bg-background md:items-center md:justify-center md:py-12">
      <div className="flex min-h-dvh w-full flex-col md:min-h-0 md:max-w-[28rem] md:rounded-card md:border md:border-border md:bg-card md:shadow-e2">
        <div
          className={cn(
            "flex items-center px-4 pt-3 pb-2 pt-safe md:px-6 md:pt-6",
            dismiss.kind === "close" ? "justify-end" : "justify-start",
          )}
        >
          <button
            type="button"
            onClick={dismiss.onDismiss}
            aria-label={
              dismiss.kind === "close" ? STRINGS.common.close : STRINGS.common.back
            }
            className={cn(
              "flex size-12 items-center justify-center rounded-full bg-muted text-foreground",
              "hover:opacity-80 active:opacity-70",
              pressableScale,
              focusRing,
            )}
          >
            <DismissIcon size={20} aria-hidden />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-8 px-4 pb-8 md:px-6">
          <div className="flex flex-col gap-2">
            <Text variant="h1">{title}</Text>
            <Text variant="body" className="text-muted-foreground">
              {subtitle}
            </Text>
          </div>

          {error ? (
            <div role="alert" className="rounded-card bg-destructive/10 p-3">
              <Text variant="body-small" className="text-center text-destructive">
                {getErrorCopy(error).message}
              </Text>
            </div>
          ) : null}

          {children}
        </div>

        <div className="sticky bottom-0 flex flex-col gap-1 border-t border-border bg-background px-4 pt-3 pb-4 pb-safe md:static md:rounded-b-card md:border-t-0 md:bg-transparent md:px-6 md:pb-6">
          {footer}
        </div>
      </div>
    </div>
  );
}

/** Label + field + error, the stacked field shape every auth form uses. */
export function AuthField({
  label,
  htmlFor,
  error,
  action,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={htmlFor}
          className="font-sans text-sm font-medium text-muted-foreground"
        >
          {label}
        </label>
        {action}
      </div>
      {children}
      {error ? (
        <Text variant="body-small" className="text-destructive">
          {error}
        </Text>
      ) : null}
    </div>
  );
}
