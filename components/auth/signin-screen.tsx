"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthField, AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/input";
import {
  PhoneInput,
  isValidGhanaPhoneNumber,
} from "@/components/ui/phone-input";
import { Text } from "@/components/ui/text";
import { focusRing, pressableScale } from "@/components/ui/pressable";
import { useSignin } from "@/lib/api/services/auth";
import { ENV } from "@/lib/env";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";

const signInSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("phone"),
    identifier: z
      .string()
      .refine(isValidGhanaPhoneNumber, STRINGS.auth.invalidPhone),
    password: z.string().min(1, STRINGS.auth.passwordRequiredError),
  }),
  z.object({
    method: z.literal("email"),
    identifier: z.email(STRINGS.auth.invalidEmail),
    password: z.string().min(1, STRINGS.auth.passwordRequiredError),
  }),
]);

type SignInFormData = z.infer<typeof signInSchema>;

/** Phone/email switcher — the same segmented pill as checkout's fulfillment toggle. */
function IdentifierMethodToggle({
  value,
  onChange,
}: {
  value: "phone" | "email";
  onChange: (method: "phone" | "email") => void;
}) {
  return (
    <div className="flex gap-2 rounded-full bg-muted p-1">
      {(["phone", "email"] as const).map((option) => {
        const isActive = value === option;
        const label =
          option === "phone"
            ? STRINGS.auth.signin.phoneTab
            : STRINGS.auth.signin.emailTab;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={isActive}
            className={cn(
              "flex min-h-12 flex-1 items-center justify-center rounded-full",
              "font-sans text-base font-bold",
              pressableScale,
              focusRing,
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function SignInScreen() {
  const router = useRouter();
  const { mutate, isPending, error } = useSignin();

  const {
    control,
    handleSubmit,
    setValue,
    resetField,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { method: "phone", identifier: "", password: "" },
  });

  const method = useWatch({ control, name: "method" });

  const onSubmit = (data: SignInFormData) => {
    mutate(
      { identifier: data.identifier, password: data.password },
      { onSuccess: () => router.replace("/home") },
    );
  };

  const switchMethod = (next: "phone" | "email") => {
    if (next === method) return;
    setValue("method", next);
    resetField("identifier", { defaultValue: "" });
  };

  return (
    <AuthShell
      title={STRINGS.auth.signin.title}
      subtitle={STRINGS.auth.signin.subtitle}
      dismiss={{ kind: "close", onDismiss: () => router.replace("/lobby") }}
      error={error}
      footer={
        <>
          <Button
            size="lg"
            isLoading={isPending}
            dimmed={isPending}
            onClick={handleSubmit(onSubmit)}
          >
            {isPending
              ? STRINGS.auth.signin.signingIn
              : STRINGS.auth.signin.continueCta}
          </Button>
          <Button variant="ghost" onClick={() => router.push("/auth/register")}>
            <Text as="span" variant="body-small">
              {STRINGS.auth.signin.noAccountPrompt}{" "}
              <Text as="span" variant="body-small" className="font-bold text-primary">
                {STRINGS.auth.signin.createAccountCta}
              </Text>
            </Text>
          </Button>
        </>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
        noValidate
      >
        <div className="flex flex-col gap-2">
          <IdentifierMethodToggle value={method} onChange={switchMethod} />

          <AuthField
            label={
              method === "phone"
                ? STRINGS.auth.signin.phoneNumberLabel
                : STRINGS.auth.signin.emailLabel
            }
            htmlFor="signin-identifier"
            error={errors.identifier?.message}
          >
            <Controller
              control={control}
              name="identifier"
              render={({ field }) =>
                method === "phone" ? (
                  <PhoneInput
                    id="signin-identifier"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={isPending}
                    aria-invalid={Boolean(errors.identifier)}
                  />
                ) : (
                  <Input
                    id="signin-identifier"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    placeholder={STRINGS.auth.emailPlaceholder}
                    disabled={isPending}
                    aria-invalid={Boolean(errors.identifier)}
                    {...field}
                  />
                )
              }
            />
          </AuthField>
        </div>

        <AuthField
          label={STRINGS.auth.signin.passwordLabel}
          htmlFor="signin-password"
          error={errors.password?.message}
          action={
            <Link
              href="/auth/forgot-password"
              className={cn(
                "-my-2 -mr-2 rounded-full p-2 font-sans text-sm text-primary",
                focusRing,
              )}
            >
              {STRINGS.auth.signin.forgotPassword}
            </Link>
          }
        >
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <PasswordInput
                id="signin-password"
                autoComplete="current-password"
                placeholder={STRINGS.auth.signin.passwordLabel}
                disabled={isPending}
                aria-invalid={Boolean(errors.password)}
                {...field}
              />
            )}
          />
        </AuthField>

        {/* Submitting with Enter from any field. */}
        <button type="submit" className="hidden" tabIndex={-1} aria-hidden />
      </form>

      {ENV.TERMS_URL ? (
        <Text variant="body-small" className="text-muted-foreground">
          {STRINGS.auth.signin.termsAgreement}{" "}
          <a
            href={ENV.TERMS_URL}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            {STRINGS.auth.signin.termsOfService}
          </a>{" "}
          {STRINGS.auth.signin.and}{" "}
          <a
            href={`${ENV.TERMS_URL}#privacy-policy`}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            {STRINGS.auth.signin.privacyPolicy}
          </a>
        </Text>
      ) : null}
    </AuthShell>
  );
}
