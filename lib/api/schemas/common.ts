import { z } from "zod";

/** Standard list envelope used by /companies, /products and /search. */
export const MetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total_records: z.number(),
  total_pages: z.number(),
});

export type Meta = z.infer<typeof MetaSchema>;

export function paginated<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    meta: MetaSchema,
    data: z.array(item).nullish().transform((value) => value ?? []),
  });
}

/**
 * /orders uses a different envelope from every other list endpoint —
 * `{ total, limit, offset }` instead of `{ page, total_pages }`.
 */
export const OffsetMetaSchema = z.object({
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export function offsetPaginated<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    meta: OffsetMetaSchema,
    data: z.array(item).nullish().transform((value) => value ?? []),
  });
}

/** Endpoints that answer with no body (DELETE). */
export const EmptySchema = z.unknown().transform(() => undefined);
