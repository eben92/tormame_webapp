import type { Company } from "@/lib/api/schemas/catalog";
import { ENV } from "@/lib/env";
import { storeImageUrl } from "@/lib/store-image";

function verticalOf(company: Company): string | undefined {
  if (typeof company.category === "string") return company.category;
  return company.category?.vertical ?? undefined;
}

/**
 * Structured data for a store page. Only fields the API actually returned are
 * emitted — a fabricated rating or address is worse than none, and search
 * engines penalise markup that disagrees with the visible page.
 */
export function ShopJsonLd({ company }: { company: Company }) {
  const vertical = verticalOf(company)?.toUpperCase();
  const image = storeImageUrl(company);
  const ratingCount = company.rating_count ?? 0;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": vertical === "FOOD" ? "Restaurant" : "Store",
    name: company.name,
    url: `${ENV.SITE_URL}/shops/${company.id}`,
    ...(company.description ? { description: company.description } : {}),
    ...(image ? { image } : {}),
    ...(company.msisdn ? { telephone: company.msisdn } : {}),
    ...(company.rating && ratingCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: company.rating,
            reviewCount: ratingCount,
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      // The payload is built from validated API fields, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
