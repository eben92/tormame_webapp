/** The picture fields an order row can be represented by. */
export interface OrderImageSource {
  shop_image_url?: string | null;
  first_item_image_url?: string | null;
}

/** Shown when an order has neither a shop picture nor an item photo. */
export const ORDER_IMAGE_FALLBACK = "/auth.webp";

/**
 * Which picture stands for an order in a list.
 *
 * The shop's own banner, not the first item's photo: a customer scanning their
 * orders is looking for *who* they ordered from, and a close-up of one dish
 * tells them far less than the storefront they recognise. The item photo stays
 * as the fallback, so rows still have a picture on orders placed before the
 * API began returning `shop_image_url`.
 */
export function orderImageUrl(order: OrderImageSource | null | undefined): string {
  return (
    order?.shop_image_url?.trim() ||
    order?.first_item_image_url?.trim() ||
    ORDER_IMAGE_FALLBACK
  );
}
