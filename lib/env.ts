/**
 * Public runtime configuration. Every value here is inlined into the client
 * bundle, so nothing secret belongs in this file.
 */
export const ENV = {
  BACKEND_URL:
    process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://staging.api.quups.app/v1",
  /** Absolute origin, used for canonical URLs, Open Graph and the sitemap. */
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "https://tormame.app",
  TERMS_URL: process.env.NEXT_PUBLIC_TERMS_URL ?? "",
  CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@quups.app",
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.1",
} as const;
