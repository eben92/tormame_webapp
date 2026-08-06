import type { MetadataRoute } from "next";
import { ENV } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Session-scoped routes render nothing useful without a signed-in
      // browser, so there is no reason to spend crawl budget on them.
      disallow: [
        "/addresses",
        "/auth/",
        "/callback/",
        "/checkout",
        "/onboarding",
        "/order-confirmation",
        "/order-details/",
        "/order-payment",
        "/orders",
        "/personal-info",
        "/profile",
        "/settings",
      ],
    },
    sitemap: `${ENV.SITE_URL}/sitemap.xml`,
  };
}
