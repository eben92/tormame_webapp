import { toTitleCase } from "@/lib/utils";

/** Which drawing in `components/lobby/category-artwork` a vertical uses. */
export type CategoryArtKey =
  | "food"
  | "grocery"
  | "pharmacy"
  | "electronics"
  | "fashion"
  | "beauty"
  | "entertainment"
  | "digital"
  | "default";

export interface CategoryArt {
  artKey: CategoryArtKey;
  /** Tailwind class for the tile wash — see the `--tile-*` tokens. */
  tint: string;
  /** One line under the tile's name. Empty for verticals we can't describe. */
  blurb: string;
}

const NEUTRAL: CategoryArt = {
  artKey: "default",
  tint: "bg-tile-neutral",
  blurb: "",
};

/**
 * Artwork, wash and blurb for each category vertical, keyed by its Title Case
 * display label (matching `toTitleCase(apiLabel)`) exactly like `CATEGORY_ICONS`.
 *
 * The lobby shows the goods themselves — a burger, a grocery bag, a capsule —
 * rather than line icons, because it has to read as a shop front to someone who
 * has never used a delivery app. A picture of a meal says "food" without being
 * read.
 */
const CATEGORY_ART: Record<string, CategoryArt> = {
  Food: {
    artKey: "food",
    tint: "bg-tile-food",
    blurb: "Restaurants & takeaway",
  },
  Grocery: {
    artKey: "grocery",
    tint: "bg-tile-grocery",
    blurb: "Fresh & everyday",
  },
  Groceries: {
    artKey: "grocery",
    tint: "bg-tile-grocery",
    blurb: "Fresh & everyday",
  },
  Pharmacy: {
    artKey: "pharmacy",
    tint: "bg-tile-pharmacy",
    blurb: "Medicine & health",
  },
  Health: {
    artKey: "pharmacy",
    tint: "bg-tile-pharmacy",
    blurb: "Medicine & health",
  },
  Electronics: {
    artKey: "electronics",
    tint: "bg-tile-electronics",
    blurb: "Phones & gadgets",
  },
  Fashion: {
    artKey: "fashion",
    tint: "bg-tile-fashion",
    blurb: "Clothes & shoes",
  },
  Beauty: {
    artKey: "beauty",
    tint: "bg-tile-beauty",
    blurb: "Skincare & makeup",
  },
  Entertainment: {
    artKey: "entertainment",
    tint: "bg-tile-entertainment",
    blurb: "Events & tickets",
  },
  Events: {
    artKey: "entertainment",
    tint: "bg-tile-entertainment",
    blurb: "Events & tickets",
  },
  Digital: {
    artKey: "digital",
    tint: "bg-tile-digital",
    blurb: "Airtime, data & bills",
  },
  Shops: { ...NEUTRAL, blurb: "Everything else" },
  Express: { ...NEUTRAL, blurb: "Quick deliveries" },
};

/** Never invents category-specific art or copy for a label we don't recognise. */
export function categoryArt(label: string): CategoryArt {
  return CATEGORY_ART[toTitleCase(label)] ?? NEUTRAL;
}
