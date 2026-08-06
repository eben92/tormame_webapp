"use client";

import { ENV } from "@/lib/env";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string },
      ) => Promise<string>;
    };
  }
}

/**
 * Headers the backend reads to verify a request. Verification happens there —
 * the browser only ever produces a token, and the secret that checks it never
 * leaves the server.
 */
export const RECAPTCHA_TOKEN_HEADER = "X-Recaptcha-Token";
export const RECAPTCHA_ACTION_HEADER = "X-Recaptcha-Action";

const SCRIPT_ID = "recaptcha-v3";

let scriptPromise: Promise<void> | null = null;

/** Loads the v3 script once per document, however many requests ask for it. */
function loadScript(siteKey: string): Promise<void> {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      if (window.grecaptcha) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("recaptcha")));
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("recaptcha"));
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    // Let the next request try again rather than caching the failure forever.
    scriptPromise = null;
    throw error;
  });

  return scriptPromise;
}

/**
 * A reCAPTCHA v3 token for `action`, or `null` when one can't be produced —
 * no site key configured (the local-development default), the script blocked,
 * or Google unreachable.
 *
 * Null is deliberate rather than a thrown error: the token is evidence the
 * backend weighs, not a gate the browser enforces, and a customer who has just
 * paid must not be stranded because an ad blocker ate a script.
 */
export async function getRecaptchaToken(
  action: string,
): Promise<string | null> {
  const siteKey = ENV.RECAPTCHA_SITE_KEY;
  if (!siteKey || typeof window === "undefined") return null;

  try {
    await loadScript(siteKey);
    const grecaptcha = window.grecaptcha;
    if (!grecaptcha) return null;

    await new Promise<void>((resolve) => grecaptcha.ready(resolve));
    return await grecaptcha.execute(siteKey, { action });
  } catch {
    return null;
  }
}
