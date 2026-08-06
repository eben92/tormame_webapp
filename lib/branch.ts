import type { Branch } from '@/lib/api/schemas/catalog';

/**
 * Case-insensitive city comparison between a branch and the customer's context
 * city. Mirrors the matching semantics of `findCityMatch` in `lib/city.ts`.
 */
export function isBranchInCity(branch: Branch, contextCity: string | null | undefined): boolean {
  if (!contextCity) return false;
  const needle = contextCity.trim().toLowerCase();
  if (!needle) return false;
  return branch.city.trim().toLowerCase() === needle;
}

/**
 * The branch to preselect at checkout: the first branch in the customer's own
 * city, else the store's main branch.
 *
 * The list arrives oldest-first from the backend, so "first match" is "the
 * original shop in that town" — deterministic, and the branch most likely to be
 * the one a customer means. Falling back to the main branch (rather than to
 * nothing) keeps a single tap sufficient for the common case; the customer can
 * always override in the sheet.
 *
 * Deliberately no distance ranking: branch coordinates are frequently unset and
 * read as 0, which would rank an address-less branch as if it sat off the coast.
 */
export function pickDefaultBranch(
  branches: Branch[],
  contextCity: string | null | undefined
): Branch | null {
  if (branches.length === 0) return null;

  const inCity = branches.find((b) => isBranchInCity(b, contextCity));
  if (inCity) return inCity;

  return branches.find((b) => b.is_main) ?? branches[0];
}
