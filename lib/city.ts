import type { Address } from '@/lib/api/schemas/account';

/**
 * Case-insensitive match of a free-text city (e.g. from a saved address) against
 * the backend city directory. Returns the canonical city name or null.
 */
export function findCityMatch(city: string | null | undefined, names: string[]): string | null {
  if (!city) return null;
  const needle = city.trim().toLowerCase();
  if (!needle) return null;
  return names.find((n) => n.toLowerCase() === needle) ?? null;
}

/**
 * The city to auto-select at login: the default address's city (or the first
 * address's) matched against the directory. Null when nothing matches.
 */
export function pickLoginCity(addresses: Address[], cityNames: string[]): string | null {
  const preferred = addresses.find((a) => a.is_default) ?? addresses[0];
  return findCityMatch(preferred?.city, cityNames);
}
