import { toTitleCase } from "@/lib/utils";

export interface CategoryArt {
  /** Square, transparent-background illustration of the goods themselves. */
  src: string;
  /** Tailwind class for the tile wash — see the `--tile-*` tokens. */
  tint: string;
  /** One line under the tile's name. Empty for verticals we can't describe. */
  blurb: string;
}

const NEUTRAL: CategoryArt = {
  src: "/categories/default.svg",
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
 *
 * Swapping in commissioned 3D renders is a file drop: keep the same paths, a
 * square canvas and a transparent background (PNG or WebP at 2x, so 192×192,
 * work as-is — only the extension in this map changes).
 */
const CATEGORY_ART: Record<string, CategoryArt> = {
  Food: {
    src: "/categories/food.svg",
    tint: "bg-tile-food",
    blurb: "Restaurants & takeaway",
  },
  Grocery: {
    src: "/categories/grocery.svg",
    tint: "bg-tile-grocery",
    blurb: "Fresh & everyday",
  },
  Groceries: {
    src: "/categories/grocery.svg",
    tint: "bg-tile-grocery",
    blurb: "Fresh & everyday",
  },
  Pharmacy: {
    src: "/categories/pharmacy.svg",
    tint: "bg-tile-pharmacy",
    blurb: "Medicine & health",
  },
  Health: {
    src: "/categories/pharmacy.svg",
    tint: "bg-tile-pharmacy",
    blurb: "Medicine & health",
  },
  Electronics: {
    src: "/categories/electronics.svg",
    tint: "bg-tile-electronics",
    blurb: "Phones & gadgets",
  },
  Fashion: {
    src: "/categories/fashion.svg",
    tint: "bg-tile-fashion",
    blurb: "Clothes & shoes",
  },
  Beauty: {
    src: "/categories/beauty.svg",
    tint: "bg-tile-beauty",
    blurb: "Skincare & makeup",
  },
  Entertainment: {
    src: "/categories/entertainment.svg",
    tint: "bg-tile-entertainment",
    blurb: "Events & tickets",
  },
  Events: {
    src: "/categories/entertainment.svg",
    tint: "bg-tile-entertainment",
    blurb: "Events & tickets",
  },
  Digital: {
    src: "/categories/digital.svg",
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
