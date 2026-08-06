import "server-only";

import { connection } from "next/server";

/**
 * Holds a subtree back to request time.
 *
 * Every screen in this app is a React Query component, and React Query reads
 * the clock (`Date.now()`) while rendering — a value a build-time prerender
 * refuses. Without this, such a subtree is quietly left out of the prerendered
 * HTML, and the shipped page is a skeleton that only fills in once JavaScript
 * runs: bad for a crawler, bad for a slow phone.
 *
 * Calling this before the data read moves the render to request time instead,
 * so the static shell still comes from the CDN and the real markup streams into
 * the same response. The data behind it is cached (`use cache`), so this costs
 * a render, not a backend call.
 */
export function requestTime() {
  return connection();
}
