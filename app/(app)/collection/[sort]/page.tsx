import { Suspense } from "react";
import type { Metadata } from "next";
import { CollectionScreen } from "@/components/collection/collection-screen";
import { CollectionSkeleton } from "@/components/shell/route-skeletons";
import {
  COMPANIES_PAGE_SIZE,
  getCompaniesPage,
} from "@/lib/api/server/catalog";
import { requestTime } from "@/lib/api/server/request-time";
import { collectionSort, collectionTitle } from "@/lib/collection";

/** Both collections are known up front, so both prerender with their stores. */
export function generateStaticParams() {
  return [{ sort: "popular" }, { sort: "trending" }];
}

export async function generateMetadata({
  params,
}: PageProps<"/collection/[sort]">): Promise<Metadata> {
  const { sort } = await params;
  const title = collectionTitle(collectionSort(sort));

  return {
    title,
    description: `${title} near you, ready to order and delivered fast.`,
    alternates: { canonical: `/collection/${collectionSort(sort)}` },
  };
}

async function CollectionContent({
  params,
}: Pick<PageProps<"/collection/[sort]">, "params">) {
  await requestTime();
  const { sort } = await params;
  const resolved = collectionSort(sort);
  const page = await getCompaniesPage({
    sort: resolved,
    limit: COMPANIES_PAGE_SIZE,
  });

  return <CollectionScreen sort={resolved} initialPage={page} />;
}

export default function CollectionPage({
  params,
}: PageProps<"/collection/[sort]">) {
  return (
    <Suspense fallback={<CollectionSkeleton />}>
      <CollectionContent params={params} />
    </Suspense>
  );
}
