/**
 * Where to send someone after they sign in.
 *
 * The destination arrives in the URL, so it is attacker-controlled: only a path
 * on this site is ever followed. `//evil.com` and `https://evil.com` are both
 * absolute URLs to a browser, and `\\evil.com` is treated as one too, so a leading
 * slash on its own is not enough of a check.
 */
export const DEFAULT_SIGNED_IN_PATH = "/home";

export function safeRedirectPath(
  value: string | null | undefined,
  fallback: string = DEFAULT_SIGNED_IN_PATH,
): string {
  const path = value?.trim();
  if (!path) return fallback;
  if (!path.startsWith("/")) return fallback;
  if (path.startsWith("//") || path.startsWith("/\\")) return fallback;
  return path;
}

/** The reasons a screen can send someone to sign in. */
export type AuthReason = "checkout" | "account";

export function parseAuthReason(
  value: string | null | undefined,
): AuthReason | null {
  return value === "checkout" || value === "account" ? value : null;
}

/** Carries the destination and the explanation across sign-in ↔ create-account. */
export function authQuery(
  redirect: string | null,
  reason: string | null,
): string {
  const params = new URLSearchParams();
  if (redirect) params.set("redirect", redirect);
  if (reason) params.set("reason", reason);
  const query = params.toString();
  return query ? `?${query}` : "";
}
