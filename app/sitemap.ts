import type { MetadataRoute } from "next";
import { getCompaniesPage } from "@/lib/api/server/catalog";
import { ENV } from "@/lib/env";

const STATIC_ROUTES = [
  "/",
  "/home",
  "/explore",
  "/collection/popular",
  "/collection/trending",
  // Public and useful to a customer searching for "track my Tormame order".
  "/track",
];

/** Policy pages: public, rarely changed, and worth indexing. */
const LEGAL_ROUTES = ["/terms", "/privacy", "/cookies"];

/**
 * Public surface only. Everything behind a session (orders, checkout, profile)
 * is excluded here and disallowed in robots.ts — it would 404 for a crawler
 * anyway, since the session lives in the browser.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stores = await getCompaniesPage({ limit: 100 });

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${ENV.SITE_URL}${route}`,
      changeFrequency: "daily" as const,
      priority: route === "/" ? 1 : 0.8,
    })),
    ...LEGAL_ROUTES.map((route) => ({
      url: `${ENV.SITE_URL}${route}`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
    ...(stores?.data ?? []).map((store) => ({
      url: `${ENV.SITE_URL}/shops/${store.id}`,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];
}
