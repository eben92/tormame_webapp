import { z } from "zod";
import { CompanySchema } from "./catalog";

export const ProductImageSchema = z.object({
  id: z.number(),
  url: z.string(),
  name: z.string().optional(),
  product_id: z.string().optional(),
});

export const CompanyCategorySchema = z.object({
  id: z.string(),
  company_id: z.string().optional(),
  name: z.string(),
  sort_order: z.number().optional(),
});

export type CompanyCategory = z.infer<typeof CompanyCategorySchema>;

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  is_draft: z.boolean().optional(),
  is_archived: z.boolean().optional(),
  is_available: z.boolean(),
  is_digital: z.boolean().optional(),
  currency: z.string().optional(),
  company_id: z.string(),
  images: z.array(ProductImageSchema).nullish().transform((v) => v ?? []),
  categories: z
    .array(CompanyCategorySchema)
    .nullish()
    .transform((v) => v ?? []),
  total_quantity: z.number().optional(),
  min_price: z.number(),
  variant_count: z.number().optional(),
  has_modifiers: z.boolean().optional(),
  base_price: z.number().optional(),
  allergens: z.string().nullish(),
});

export type Product = z.infer<typeof ProductSchema>;

export const ProductVariantSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  image_url: z.string().nullish(),
  quantity: z.number().optional(),
  is_system_gen: z.boolean().optional(),
  product_id: z.string().optional(),
});

export type ProductVariant = z.infer<typeof ProductVariantSchema>;

export const ProductModifierOptionSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  image_url: z.string().nullish(),
  is_draft: z.boolean().optional(),
  is_available: z.boolean().optional(),
});

export type ProductModifierOption = z.infer<typeof ProductModifierOptionSchema>;

export const ProductModifierGroupSchema = z.object({
  id: z.number(),
  name: z.string(),
  min_select: z.number(),
  max_select: z.number(),
  is_required: z.boolean(),
  options: z
    .array(ProductModifierOptionSchema)
    .nullish()
    .transform((v) => v ?? []),
});

export type ProductModifierGroup = z.infer<typeof ProductModifierGroupSchema>;

export const ProductDetailSchema = ProductSchema.extend({
  variants: z.array(ProductVariantSchema).nullish().transform((v) => v ?? []),
  modifier_groups: z
    .array(ProductModifierGroupSchema)
    .nullish()
    .transform((v) => v ?? []),
});

export type ProductDetail = z.infer<typeof ProductDetailSchema>;

/** Category header of a menu section. `id` is null for the synthetic "Other" section. */
export const MenuCategorySchema = z.object({
  id: z.string().nullable(),
  name: z.string(),
  sort_order: z.number().nullable().optional(),
});

/** One category and the products assigned to it. A product appears in exactly one section. */
export const MenuSectionSchema = z.object({
  category: MenuCategorySchema,
  products: z.array(ProductSchema).nullish().transform((v) => v ?? []),
});

export type MenuSection = z.infer<typeof MenuSectionSchema>;

export const SearchResultItemSchema = z.object({
  company: CompanySchema,
  products: z.array(ProductSchema).nullish().transform((v) => v ?? []),
});

export type SearchResultItem = z.infer<typeof SearchResultItemSchema>;
