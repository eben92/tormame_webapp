/** Products rendered in an explore-search store rail before the "View all" tile. */
export const RAIL_VISIBLE_PRODUCTS = 5;

const RAIL_GUTTER = 16;
const RAIL_GAP = 12;
const RAIL_CARDS_PER_VIEW = 2.8;

/**
 * Card width that fits 2.8 cards across the viewport, so the third card peeks in as the
 * horizontal-scroll affordance.
 */
export function railCardWidth(screenWidth: number): number {
  return Math.round(
    (screenWidth - RAIL_GUTTER - RAIL_GAP * RAIL_CARDS_PER_VIEW) / RAIL_CARDS_PER_VIEW
  );
}

/**
 * Splits a store's search products into the cards to render and whether a "View all" tile
 * belongs at the end of the rail. The API returns one product more than the rail shows
 * (`RAIL_VISIBLE_PRODUCTS + 1`) purely as a has-more sentinel, so that extra product is
 * dropped rather than displayed.
 */
export function splitRailProducts<T>(products: T[]): { visible: T[]; hasMore: boolean } {
  return {
    visible: products.slice(0, RAIL_VISIBLE_PRODUCTS),
    hasMore: products.length > RAIL_VISIBLE_PRODUCTS,
  };
}
