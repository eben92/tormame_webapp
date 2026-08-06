"use client";

import * as React from "react";
import { ENV } from "@/lib/env";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const SCRIPT_ID = "recaptcha-v3";

/** Loads the v3 script once per document, however many hooks ask for it. */
function loadScript(siteKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      if (window.grecaptcha) resolve();
      else {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => reject(new Error("recaptcha")));
      }
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("recaptcha"));
    document.head.appendChild(script);
  });
}

export type RecaptchaState = "checking" | "passed" | "failed";

/**
 * Runs an invisible reCAPTCHA v3 check for `action` and has the server verify
 * the token (the secret can't be trusted to the browser).
 *
 * Callers gate their request on `state === "passed"`. With no site key
 * configured the hook passes immediately, so local development doesn't need
 * Google credentials to exercise the page.
 */
export function useRecaptcha(action: string) {
  const siteKey = ENV.RECAPTCHA_SITE_KEY;
  const [state, setState] = React.useState<RecaptchaState>(
    siteKey ? "checking" : "passed",
  );
  const [attempt, setAttempt] = React.useState(0);

  React.useEffect(() => {
    if (!siteKey) return;

    let cancelled = false;

    void (async () => {
      try {
        await loadScript(siteKey);
        const grecaptcha = window.grecaptcha;
        if (!grecaptcha) throw new Error("recaptcha");

        await new Promise<void>((resolve) => grecaptcha.ready(resolve));
        const token = await grecaptcha.execute(siteKey, { action });

        const response = await fetch("/api/recaptcha", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, action }),
        });
        const body = (await response.json()) as { ok?: boolean };
        if (!cancelled) setState(body.ok ? "passed" : "failed");
      } catch {
        // A blocked or unreachable Google must not hold a paying customer
        // hostage; the server-side check is the one that actually gates abuse.
        if (!cancelled) setState("passed");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [siteKey, action, attempt]);

  const retry = React.useCallback(() => {
    setState("checking");
    setAttempt((count) => count + 1);
  }, []);

  return { state, retry };
}
