import { z } from "zod";

export const FulfillmentTypeSchema = z.enum(["DELIVERY", "PICKUP"]);
export type FulfillmentType = z.infer<typeof FulfillmentTypeSchema>;

export const OrderStatusEventSchema = z.object({
  status: z.string(),
  created_at: z.string(),
});

export type OrderStatusEvent = z.infer<typeof OrderStatusEventSchema>;

export const OrderItemModifierSchema = z.object({
  id: z.number(),
  modifier_name: z.string(),
  option_name: z.string(),
  unit_price: z.number(),
});

export const OrderItemSchema = z.object({
  id: z.string(),
  product_id: z.string(),
  product_variant_id: z.string().nullish(),
  product_name: z.string(),
  variant_name: z.string().nullish(),
  unit_price: z.number(),
  quantity: z.number(),
  subtotal: z.number(),
  image_url: z.string().nullish(),
  modifiers: z.array(OrderItemModifierSchema).nullish(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

export const DeliveryAddressSnapshotSchema = z.object({
  formatted_address: z.string().nullish(),
  street: z.string().nullish(),
  city: z.string().nullish(),
  landmark: z.string().nullish(),
});

export const OrderSchema = z.object({
  id: z.string(),
  status: z.string(),
  payment_status: z.string(),
  payment_reference: z.string().nullish(),
  confirmation_code: z.string().nullish(),
  fulfillment_type: FulfillmentTypeSchema,
  shop_name: z.string().nullish(),
  branch_name: z.string().nullish(),
  company_id: z.string(),
  branch_address: z.string().nullish(),
  subtotal_amount: z.number(),
  delivery_fee: z.number(),
  total_amount: z.number(),
  currency: z.string().optional(),
  created_at: z.string(),
  status_history: z.array(OrderStatusEventSchema).nullish(),
  items: z.array(OrderItemSchema).nullish(),
  first_item_image_url: z.string().nullish(),
  /** The shop's banner (logo as its own fallback) — what an order row shows. */
  shop_image_url: z.string().nullish(),
  first_item_name: z.string().nullish(),
  delivery_address_snapshot: DeliveryAddressSnapshotSchema.nullish(),
});

export type Order = z.infer<typeof OrderSchema>;

export const OrderPlacementSchema = z.object({
  order: OrderSchema,
  authorization_url: z.string().nullish(),
  confirmation_code: z.string().nullish(),
  order_tracking_token: z.string().nullish(),
});

export type OrderPlacement = z.infer<typeof OrderPlacementSchema>;

export const PaymentAuthorizationSchema = z.object({
  authorization_url: z.string(),
});

export const OrderRatingSchema = z.object({
  id: z.string(),
  order_id: z.string(),
  user_id: z.string().optional(),
  rating: z.number(),
  comment: z.string().nullish(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type OrderRating = z.infer<typeof OrderRatingSchema>;

export type OrderItemInput = {
  product_id: string;
  product_variant_id?: string;
  quantity: number;
  modifier_option_ids?: number[];
};

export type PlaceOrderInput = {
  company_id: string;
  fulfillment_type: FulfillmentType;
  branch_id?: string;
  address_id?: string;
  new_address?: {
    street: string;
    city: string;
    region: string;
    country: string;
    formatted_address: string;
    landmark?: string;
    postal_code?: string;
    phone?: string;
  };
  items: OrderItemInput[];
  note?: string;
};
