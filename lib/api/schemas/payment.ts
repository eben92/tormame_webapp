import { z } from "zod";

/**
 * `GET /orders/payment-redirect?reference=…` — the public lookup Paystack sends
 * a customer back to. It carries no session, so it returns only what a receipt
 * needs.
 *
 * `payment_status` is typed as a plain string rather than an enum on purpose:
 * this page is the last thing a customer sees after paying, and it must not
 * fail closed because the backend added a status we haven't seen yet. Unknown
 * values fall through to the "still confirming" branch.
 */
export const PaymentRedirectOrderSchema = z.object({
  order_id: z.string(),
  status: z.string(),
  payment_status: z.string(),
  shop_name: z.string().nullish(),
  branch_name: z.string().nullish(),
  fulfillment_type: z.string().nullish(),
  subtotal_amount: z.number(),
  delivery_fee: z.number(),
  total_amount: z.number(),
  currency: z.string().nullish(),
  items: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.number(),
        price: z.number(),
      }),
    )
    .nullish()
    .transform((value) => value ?? []),
  created_at: z.string().nullish(),
});

export type PaymentRedirectOrder = z.infer<typeof PaymentRedirectOrderSchema>;

export const PAYMENT_PAID = "PAID";
export const PAYMENT_FAILED = "FAILED";
