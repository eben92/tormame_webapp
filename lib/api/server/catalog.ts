import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";
import {
  CategoriesGroupSchema,
  CitySchema,
  CompanyPageSchema,
  CompanySchema,
  type CategoriesGroup,
  type City,
  type Company,
  type CompanyPage,
} from "@/lib/api/schemas/catalog";
import { MenuSectionSchema, type MenuSection } from "@/lib/api/schemas/product";
import { serverFetch, tolerant } from "@/lib/api/server/fetch";

export { COMPANIES_PAGE_SIZE } from "@/lib/api/constants";

/**
 * Every reader below is split in two: a `use cache` function that does the
 * fetch, and an exported wrapper that swallows failures. Keeping `cacheLife` at
 * the top of the cached scope (rather than branching on success inside it) is
 * what the caching docs ask for, and a rejected read is simply not cached.
 */

async function readCities(): Promise<City[]> {
  "use cache";
  cacheLife("days");
  cacheTag("cities");

  const cities = await serverFetch("/cities", z.array(CitySchema).nullish());
  return cities ?? [];
}

/** The city directory. Changes when the business opens a new town, so: days. */
export function getCities() {
  return tolerant(readCities);
}

async function readCategoryGroups(): Promise<CategoriesGroup[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");

  const groups = await serverFetch(
    "/categories/grouped",
    z.array(CategoriesGroupSchema).nullish(),
  );
  return groups ?? [];
}

/**
 * Raw category groups — deliberately not mapped to `CategoryChip`, because a
 * chip carries a Lucide component that cannot cross the server/client boundary.
 * The client hook's `select` does the mapping, so this is exactly the shape
 * TanStack Query expects as initial data.
 */
export function getCategoryGroups() {
  return tolerant(readCategoryGroups);
}

export type CompanyQuery = {
  sort?: "popular" | "trending";
  categoryVertical?: string;
  limit?: number;
};

/**
 * No `city` here. The city a customer picked lives in `localStorage`, which the
 * server can't read, and the backend only uses it to resolve a store's delivery
 * fee — the list itself is the same. So the server renders the list, and the
 * client query fills the fee in when it revalidates.
 */
function companiesEndpoint(query: CompanyQuery, offset: number) {
  const params = new URLSearchParams();
  if (query.sort) params.append("sort", query.sort);
  if (query.categoryVertical)
    params.append("category_vertical", query.categoryVertical);
  params.append("limit", String(query.limit ?? 20));
  params.append("offset", String(offset));

  return `/companies?${params.toString()}`;
}

async function readCompaniesPage(query: CompanyQuery): Promise<CompanyPage> {
  "use cache";
  cacheLife("minutes");
  cacheTag("companies");

  return serverFetch(companiesEndpoint(query, 0), CompanyPageSchema);
}

/**
 * First page of a store list. `minutes` keeps opening hours and promos close to
 * live while still landing in the prefetched shell (its 5-minute `stale` is the
 * threshold for that).
 */
export function getCompaniesPage(query: CompanyQuery) {
  return tolerant(() => readCompaniesPage(query));
}

async function readCompany(companyId: string): Promise<Company> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`company:${companyId}`);

  return serverFetch(`/shops/${companyId}`, CompanySchema);
}

/** A single store. Public endpoint — works for signed-out visitors and crawlers. */
export function getCompany(companyId: string) {
  return tolerant(() => readCompany(companyId));
}

async function readCompanyMenu(companyId: string): Promise<MenuSection[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`menu:${companyId}`);

  const menu = await serverFetch(
    `/companies/${companyId}/menu`,
    z.array(MenuSectionSchema).nullish(),
  );
  return menu ?? [];
}

/** The whole menu, sections already grouped by the server. */
export function getCompanyMenu(companyId: string) {
  return tolerant(() => readCompanyMenu(companyId));
}
