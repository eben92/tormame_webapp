"use client";

import * as React from "react";

/**
 * The one breakpoint the app switches layout on: below it the UI is the mobile
 * app pixel-for-pixel, at and above it the desktop marketplace shell takes over.
 */
export const DESKTOP_QUERY = "(min-width: 768px)";

export function useMediaQuery(query: string): boolean {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    // Server render assumes mobile, matching the mobile-first CSS.
    () => false,
  );
}

export function useIsDesktop(): boolean {
  return useMediaQuery(DESKTOP_QUERY);
}
