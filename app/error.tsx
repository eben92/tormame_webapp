"use client";

import * as React from "react";
import { ErrorState } from "@/components/ui/states";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <ErrorState error={error} onRetry={reset} />
    </div>
  );
}
