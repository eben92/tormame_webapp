import { toTitleCase } from "@/lib/utils";

/**
 * How the lobby's verticals are ranked: most-ordered first, so Food takes the
 * featured tile — it is what most customers came for. The API returns its
 * categories in no guaranteed order, and a landing page whose big tile changes
 * on every reload looks broken.
 */
const DEFAULT_PRIORITY = [
  "Food",
  "Grocery",
  "Groceries",
  "Pharmacy",
  "Health",
  "Electronics",
  "Fashion",
  "Beauty",
  "Digital",
  "Entertainment",
  "Events",
  "Express",
  "Shops",
];

/** Anything we don't rank sorts after what we do, alphabetically — never at random. */
export function sortCategoriesByDefault(labels: string[]): string[] {
  const rank = (label: string) => {
    const index = DEFAULT_PRIORITY.indexOf(toTitleCase(label));
    return index === -1 ? DEFAULT_PRIORITY.length : index;
  };

  return [...labels].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}
