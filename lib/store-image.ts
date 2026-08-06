export type StoreImageSource = {
  banner_url?: string | null;
  logo_url?: string | null;
};

/**
 * The single rule for which image represents a store in lists and cards: the
 * banner is the store's picture, the logo is only a fallback. Call sites used
 * to invert this and rendered tiny cropped logos wherever a banner existed.
 */
export function storeImageUrl(store: StoreImageSource | null | undefined): string | undefined {
  if (!store) return undefined;
  return store.banner_url || store.logo_url || undefined;
}
