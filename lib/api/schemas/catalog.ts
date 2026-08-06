import { z } from "zod";

export const CitySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  region: z.string(),
});

export type City = z.infer<typeof CitySchema>;

export const VerticalSchema = z.string();

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  sort_order: z.number().optional(),
  is_active: z.boolean().optional(),
  vertical: VerticalSchema.optional(),
});

export type Category = z.infer<typeof CategorySchema>;

export const CategoriesGroupSchema = z.object({
  vertical: VerticalSchema,
  categories: z.array(CategorySchema).nullish(),
  is_primary: z.boolean().optional(),
});

export type CategoriesGroup = z.infer<typeof CategoriesGroupSchema>;

/**
 * A store as returned by /companies (list) and /shops/{id} (detail). The two
 * shapes overlap but neither is a subset of the other: the list omits
 * `category` entirely while the detail returns it as an object, so every
 * non-guaranteed field stays optional here rather than in two near-identical
 * schemas that would drift.
 */
export const CompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  msisdn: z.string().optional(),
  description: z.string().nullish(),
  banner_url: z.string().nullish(),
  logo_url: z.string().nullish(),
  website: z.string().nullish(),
  status: z.string().optional(),
  category_id: z.string().nullish(),
  category: z
    .union([z.string(), CategorySchema.partial().passthrough()])
    .nullish(),
  type: z.string().nullish(),
  rating: z.number().nullish(),
  rating_count: z.number().nullish(),
  is_featured: z.boolean().optional(),
  delivery_time: z.string().nullish(),
  delivery_fee: z.number().nullish(),
  min_delivery_fee: z.number().nullish(),
  promo_percent: z.number().nullish(),
  created_at: z.string().optional(),
});

export type Company = z.infer<typeof CompanySchema>;

export const BranchSchema = z.object({
  id: z.string(),
  company_id: z.string(),
  name: z.string(),
  city: z.string(),
  city_id: z.string().nullish(),
  region: z.string(),
  street: z.string(),
  formatted_address: z.string(),
  is_main: z.boolean(),
});

export type Branch = z.infer<typeof BranchSchema>;
