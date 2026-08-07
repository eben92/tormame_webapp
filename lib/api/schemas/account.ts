import { z } from "zod";

export const AddressSchema = z.object({
  id: z.string(),
  label: z.string().nullish(),
  street: z.string(),
  city: z.string(),
  region: z.string(),
  country: z.string(),
  formatted_address: z.string(),
  landmark: z.string().nullish(),
  postal_code: z.string().nullish(),
  phone: z.string().nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  is_default: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Address = z.infer<typeof AddressSchema>;

/** An address the customer typed at checkout but never saved to their account. */
export type LocalAddress = {
  street: string;
  city: string;
  region: string;
  country: string;
  formatted_address: string;
  landmark?: string;
  postal_code?: string;
  phone?: string;
};

/**
 * A pending request to delete the account and its personal data. The API
 * returns null when nothing is scheduled, which is the ordinary case.
 */
export const AccountDeletionRequestSchema = z.object({
  id: z.string(),
  status: z.string(),
  reason: z.string().nullish(),
  requested_at: z.string(),
  /** When the account is actually scrubbed, unless it is cancelled first. */
  scheduled_for: z.string(),
});

export type AccountDeletionRequest = z.infer<
  typeof AccountDeletionRequestSchema
>;

export type CreateAddressInput = LocalAddress & {
  label?: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
};

export type UpdateAddressInput = Partial<CreateAddressInput>;

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().nullish(),
  msisdn: z.string().nullish(),
  full_name: z.string().nullish(),
  image_url: z.string().nullish(),
  verified_at: z.string().nullish(),
  access_token: z.string(),
  refresh_token: z.string(),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;

export const OtpSessionSchema = z.object({
  message: z.string().optional(),
  requires_otp: z.boolean().optional(),
  session_id: z.string().optional(),
});

export type OtpSession = z.infer<typeof OtpSessionSchema>;

export const ProfileSchema = z.object({
  id: z.string(),
  email: z.string().nullish(),
  full_name: z.string().nullish(),
  msisdn: z.string().nullish(),
  image_url: z.string().nullish(),
});

export type Profile = z.infer<typeof ProfileSchema>;

export const ChangePasswordResponseSchema = z.object({
  access_token: z.string().optional(),
  refresh_token: z.string().optional(),
});
