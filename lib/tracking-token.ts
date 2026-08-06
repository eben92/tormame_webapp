/**
 * Reads the order id out of a tracking token so the page knows which order to
 * ask for. The token is a signed JWT; this only *reads* the claim — nothing is
 * trusted on the strength of it, because the API validates the signature on
 * every request and rejects a token that does not match the order in the path.
 */
export function orderIdFromTrackingToken(token: string | null): string | null {
  if (!token) return null;

  const payload = token.split(".")[1];
  if (!payload) return null;

  try {
    // JWTs use base64url, which `atob` does not accept as-is.
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const claims: unknown = JSON.parse(atob(padded));
    if (typeof claims !== "object" || claims === null) return null;

    const orderId = (claims as { order_id?: unknown }).order_id;
    return typeof orderId === "string" && orderId.length > 0 ? orderId : null;
  } catch {
    // A truncated or mangled link is a dead end, not a crash.
    return null;
  }
}
