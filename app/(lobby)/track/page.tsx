import { Suspense } from "react";
import type { Metadata } from "next";
import { TrackOrderScreen } from "@/components/tracking/track-order-screen";
import { STRINGS } from "@/lib/strings";

export const metadata: Metadata = {
  title: STRINGS.track.title,
  description: STRINGS.track.subtitle,
};

/**
 * Public, no account needed. The tracking link we email carries its token in
 * the query string, which `useSearchParams` reads — hence the Suspense
 * boundary, so the static shell can still be prerendered around it.
 */
export default function TrackOrderPage() {
  return (
    <Suspense fallback={null}>
      <TrackOrderScreen />
    </Suspense>
  );
}
