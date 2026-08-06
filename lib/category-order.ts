import { toTitleCase } from "@/lib/utils";

/**
 * Reconciles the user's saved category-tile order with the categories the API currently
 * returns. Persisted order wins for labels that still exist; any label the API added since
 * the order was last saved is appended (in API order); any persisted label the API no
 * longer returns is dropped silently.
 */
export function mergeCategoryOrder(
  persistedOrder: string[],
  apiLabels: string[],
): string[] {
  const apiSet = new Set(apiLabels);
  const kept = persistedOrder.filter((label) => apiSet.has(label));
  const keptSet = new Set(kept);
  const appended = apiLabels.filter((label) => !keptSet.has(label));
  return [...kept, ...appended];
}

/**
 * How the verticals are ranked before anyone has rearranged them: most-ordered
 * first, so the featured tile is the one most customers came for. The API
 * returns its categories in no guaranteed order, and a lobby whose big tile
 * changes on every reload looks broken.
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
