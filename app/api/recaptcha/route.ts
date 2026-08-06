import { NextResponse } from "next/server";

const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

/** Google's own guidance: 0.5 is the default line between human and bot. */
const MIN_SCORE = 0.5;

type SiteVerifyResponse = {
  success?: boolean;
  score?: number;
  action?: string;
  "error-codes"?: string[];
};

/**
 * Verifies a reCAPTCHA v3 token.
 *
 * The secret never leaves the server, which is the whole reason this route
 * exists — the browser can only ever hand us a token to check. If no secret is
 * configured (local development), verification is skipped and the response says
 * so, rather than locking the page nobody can pass.
 */
export async function POST(request: Request) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  let token: unknown;
  let action: unknown;
  try {
    ({ token, action } = (await request.json()) as {
      token?: unknown;
      action?: unknown;
    });
  } catch {
    return NextResponse.json({ ok: false, reason: "malformed" }, { status: 400 });
  }

  if (typeof token !== "string" || !token) {
    return NextResponse.json({ ok: false, reason: "missing-token" }, { status: 400 });
  }

  let result: SiteVerifyResponse;
  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    result = (await response.json()) as SiteVerifyResponse;
  } catch {
    // Google being unreachable must not strand a customer who just paid.
    return NextResponse.json({ ok: true, degraded: true });
  }

  const actionMatches =
    typeof action !== "string" || !result.action || result.action === action;
  const passed =
    result.success === true && actionMatches && (result.score ?? 0) >= MIN_SCORE;

  return NextResponse.json(
    { ok: passed, reason: passed ? undefined : "rejected" },
    { status: passed ? 200 : 403 },
  );
}
