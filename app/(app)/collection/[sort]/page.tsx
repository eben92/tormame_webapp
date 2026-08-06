import type { Metadata } from "next";
import { CollectionScreen } from "@/components/collection/collection-screen";
import { collectionSort, collectionTitle } from "@/lib/collection";

export async function generateMetadata({
  params,
}: PageProps<"/collection/[sort]">): Promise<Metadata> {
  const { sort } = await params;
  return { title: collectionTitle(collectionSort(sort)) };
}

export default async function CollectionPage({
  params,
}: PageProps<"/collection/[sort]">) {
  const { sort } = await params;
  return <CollectionScreen sort={collectionSort(sort)} />;
}
