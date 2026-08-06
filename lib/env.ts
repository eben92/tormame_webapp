/**
 * Public runtime configuration. Every value here is inlined into the client
 * bundle, so nothing secret belongs in this file.
 */
export const ENV = {
  BACKEND_URL:
    process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://staging.api.quups.app/v1",
  /** Absolute origin, used for canonical URLs, Open Graph and the sitemap. */
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "https://tormame.app",
  /**
   * reCAPTCHA v3 site key. Public by design — the matching secret lives only in
   * `RECAPTCHA_SECRET_KEY`, read by app/api/recaptcha. Empty disables the check,
   * which is the local-development default.
   */
  RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "",
  TERMS_URL: process.env.NEXT_PUBLIC_TERMS_URL ?? "",
  /** Vendor onboarding, linked from the landing page's nav and footer. */
  VENDOR_URL:
    process.env.NEXT_PUBLIC_VENDOR_URL ?? "https://vendor.tormame.com",
  /**
   * Store listings. Blank hides the badge — a download button that goes nowhere
   * is worse than no download button.
   */
  IOS_APP_URL: process.env.NEXT_PUBLIC_IOS_APP_URL ?? "",
  ANDROID_APP_URL: process.env.NEXT_PUBLIC_ANDROID_APP_URL ?? "",
  /** Social profiles. Same rule: blank means the icon is not rendered. */
  FACEBOOK_URL: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "",
  INSTAGRAM_URL: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "",
  X_URL: process.env.NEXT_PUBLIC_X_URL ?? "",
  TIKTOK_URL: process.env.NEXT_PUBLIC_TIKTOK_URL ?? "",
  LINKEDIN_URL: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "",
  WHATSAPP_URL: process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "",
  CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@quups.app",
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.1",
} as const;
