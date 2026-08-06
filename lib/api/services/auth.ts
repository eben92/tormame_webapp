"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import {
  AuthUserSchema,
  AddressSchema,
  OtpSessionSchema,
  type AuthUser,
} from "@/lib/api/schemas/account";
import { CitySchema } from "@/lib/api/schemas/catalog";
import { EmptySchema } from "@/lib/api/schemas/common";
import { pickLoginCity } from "@/lib/city";
import { useOnboardingStore } from "@/stores/onboarding";
import {
  clearUserStoreAndLogout,
  useUserStore,
  type UserProps,
} from "@/stores/user";

type AuthRequest = {
  identifier?: string;
  password: string;
  email?: string;
  msisdn?: string;
  full_name?: string;
};

/** Web sessions identify themselves as such; mobile sends `channel: 'mobile'`. */
const CHANNEL = "web";

function deviceInfo() {
  const userAgent =
    typeof navigator === "undefined" ? "web" : navigator.userAgent;
  return {
    device_type: "web",
    os: typeof navigator === "undefined" ? "web" : navigator.platform,
    app_version: process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.1",
    user_agent: userAgent,
  };
}

function mapToUser(data: AuthUser): UserProps {
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    profile: {
      id: data.id,
      email: data.email ?? undefined,
      name: data.full_name ?? undefined,
      msisdn: data.msisdn ?? undefined,
      image_url: data.image_url ?? undefined,
    },
  };
}

/**
 * Post-login step: adopt the default address's city so the store list is
 * already scoped to where the customer actually is. Fire-and-forget — it never
 * blocks the sign-in UI, and any failure leaves the current selection alone.
 */
async function selectLoginCity() {
  try {
    const [addresses, cities] = await Promise.all([
      apiFetch("/me/addresses", {
        schema: z.array(AddressSchema).nullish(),
      }),
      apiFetch("/cities", { schema: z.array(CitySchema).nullish() }),
    ]);
    const match = pickLoginCity(
      addresses ?? [],
      (cities ?? []).map((city) => city.name),
    );
    if (match) useOnboardingStore.getState().setCity(match);
  } catch {
    // Network/session failure during login — keep the existing selection.
  }
}

export function useSignin() {
  return useMutation({
    mutationFn: (input: AuthRequest) =>
      apiFetch("/auth/signin", {
        method: "POST",
        body: { ...input, channel: CHANNEL, device_info: deviceInfo() },
        schema: AuthUserSchema,
      }),
    onSuccess: (data) => {
      useUserStore.setState({ user: mapToUser(data) });
      void selectLoginCity();
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (
      input: AuthRequest & {
        terms_accepted: boolean;
        marketing_consent: boolean;
      },
    ) =>
      apiFetch("/auth/register", {
        method: "POST",
        body: { ...input, channel: CHANNEL, device_info: deviceInfo() },
        schema: AuthUserSchema,
      }),
    onSuccess: (data) => {
      useUserStore.setState({ user: mapToUser(data) });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch("/logout", {
        method: "POST",
        body: { refresh_token: useUserStore.getState().user?.refresh_token },
        schema: EmptySchema,
      }),
    onSettled: () => {
      void queryClient.invalidateQueries();
      clearUserStoreAndLogout();
    },
  });
}

export function useForgottenPassword() {
  return useMutation({
    mutationFn: (msisdn: string) =>
      apiFetch(
        `/auth/forgot-password/request?msisdn=${encodeURIComponent(msisdn)}`,
        { method: "POST", body: { msisdn }, schema: OtpSessionSchema },
      ),
    onSuccess: (data) => {
      useUserStore.setState({ session_id: data.session_id });
    },
  });
}

export function useResendPasswordResetOTP() {
  return useMutation({
    mutationFn: (msisdn: string) =>
      apiFetch(
        `/auth/forgot-password/resend-otp?msisdn=${encodeURIComponent(msisdn)}`,
        { method: "POST", body: { msisdn }, schema: OtpSessionSchema },
      ),
    onSuccess: (data) => {
      if (data.session_id) {
        useUserStore.setState({ session_id: data.session_id });
      }
    },
  });
}

export function useConfirmPasswordReset() {
  return useMutation({
    mutationFn: (input: {
      otp: string;
      new_password: string;
      msisdn: string;
    }) =>
      apiFetch("/auth/forgot-password", {
        method: "POST",
        body: {
          ...input,
          session_id: useUserStore.getState().session_id,
        },
        schema: z.unknown(),
      }),
    onSuccess: () => {
      useUserStore.setState({ session_id: undefined });
    },
  });
}
