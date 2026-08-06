/**
 * Where a customer goes when they head into the application from the landing
 * page — or from anywhere else. Onboarding comes first if it hasn't been done:
 * the store list is useless until we know which town to show.
 */

export const DEFAULT_APP_PATH = "/home";

/**
 * The path to send someone to for `target`, routing them through onboarding
 * when they haven't finished it. A signed-in customer only has to pick a town
 * (`mode=city-only`), matching the native app's entry rule.
 */
export function appEntryPath(
  target: string,
  { hasOnboarded, isSignedIn }: { hasOnboarded: boolean; isSignedIn: boolean },
): string {
  if (hasOnboarded) return target;

  const params = new URLSearchParams({ next: target });
  if (isSignedIn) params.set("mode", "city-only");
  return `/onboarding?${params.toString()}`;
}

/**
 * A `next` parameter is only ever followed when it is a path on this site.
 * Anything else — an absolute URL, a protocol-relative `//evil.example` — is
 * discarded, so the parameter can't be used to bounce someone off-site.
 */
export function safeNextPath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}
