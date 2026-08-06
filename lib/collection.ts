import { STRINGS } from '@/lib/strings';

export const COLLECTION_SORTS = ['popular', 'trending'] as const;
export type CollectionSort = (typeof COLLECTION_SORTS)[number];

export function isCollectionSort(value: string | undefined): value is CollectionSort {
  return COLLECTION_SORTS.includes(value as CollectionSort);
}

/** Coerce an untrusted route param to a valid sort, defaulting to 'popular'. */
export function collectionSort(value: string | undefined): CollectionSort {
  return isCollectionSort(value) ? value : 'popular';
}

export function collectionTitle(sort: CollectionSort): string {
  return sort === 'trending' ? STRINGS.home.trendingTitle : STRINGS.home.popularTitle;
}
