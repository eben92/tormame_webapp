import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopJsonLd } from "@/components/seo/shop-json-ld";
import { ShopSkeleton } from "@/components/shell/route-skeletons";
import { ShopScreen } from "@/components/shop/shop-screen";
import { getCompany, getCompanyMenu } from "@/lib/api/server/catalog";
import { storeImageUrl } from "@/lib/store-image";

/**
 * The one page crawlers care about, so its title, description and image come
 * from the store itself rather than a generic template. `getCompany` is cached,
 * so this costs no extra request beyond the page render.
 */
export async function generateMetadata({
  params,
}: PageProps<"/shops/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompany(slug);

  if (!company) return { title: "Shop" };

  const image = storeImageUrl(company);
  const description =
    company.description ??
    `Order from ${company.name} and get it delivered fast.`;

  return {
    title: company.name,
    description,
    alternates: { canonical: `/shops/${company.id}` },
    openGraph: {
      type: "website",
      title: company.name,
      description,
      url: `/shops/${company.id}`,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

/**
 * `params` is awaited in here rather than in the page, so a store nobody has
 * visited yet still ships the route's App Shell immediately and gets upgraded
 * to its own prerender in the background.
 */
async function ShopContent({ params }: Pick<PageProps<"/shops/[slug]">, "params">) {
  const { slug } = await params;
  const [company, menu] = await Promise.all([
    getCompany(slug),
    getCompanyMenu(slug),
  ]);

  return (
    <>
      {company ? <ShopJsonLd company={company} /> : null}
      <ShopScreen companyId={slug} initialCompany={company} initialMenu={menu} />
    </>
  );
}

export default function ShopPage({ params }: PageProps<"/shops/[slug]">) {
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopContent params={params} />
    </Suspense>
  );
}
