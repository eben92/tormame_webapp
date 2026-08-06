"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, User } from "lucide-react";
import { AuthField, AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { InputWithIcon, PasswordInput } from "@/components/ui/input";
import {
  PhoneInput,
  isValidGhanaPhoneNumber,
} from "@/components/ui/phone-input";
import { Text } from "@/components/ui/text";
import { useRegister } from "@/lib/api/services/auth";
import { STRINGS } from "@/lib/strings";
import { useOnboardingStore } from "@/stores/onboarding";

const registerSchema = z.object({
  msisdn: z.string().refine(isValidGhanaPhoneNumber, STRINGS.auth.invalidPhone),
  email: z.email(STRINGS.auth.invalidEmail),
  full_name: z.string().min(2, STRINGS.auth.register.fullNameTooShort),
  password: z.string().min(6, STRINGS.auth.register.passwordTooShort),
  terms_accepted: z
    .boolean()
    .refine((value) => value, STRINGS.auth.register.termsRequired),
  marketing_consent: z.boolean().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterScreen() {
  const router = useRouter();
  const { mutate, isPending, error } = useRegister();
  const onboardingName = useOnboardingStore((state) => state.name);
  const onboardingPhone = useOnboardingStore((state) => state.phone);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      msisdn: onboardingPhone ?? "",
      email: "",
      full_name: onboardingName ?? "",
      password: "",
      terms_accepted: false,
      marketing_consent: false,
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    mutate(
      { ...data, marketing_consent: data.marketing_consent ?? false },
      { onSuccess: () => router.replace("/home") },
    );
  };

  return (
    <AuthShell
      title={STRINGS.auth.register.title}
      subtitle={STRINGS.auth.register.subtitle}
      dismiss={{ kind: "back", onDismiss: () => router.back() }}
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
              ? STRINGS.auth.register.creatingAccount
              : STRINGS.auth.register.createAccountCta}
          </Button>
          <Button variant="ghost" onClick={() => router.push("/auth/signin")}>
            <Text as="span" variant="body-small">
              {STRINGS.auth.register.alreadyHaveAccount}{" "}
              <Text
                as="span"
                variant="body-small"
                className="font-bold text-primary"
              >
                {STRINGS.auth.register.signInCta}
              </Text>
            </Text>
          </Button>
        </>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <AuthField
          label={STRINGS.auth.register.fullNameLabel}
          htmlFor="register-name"
          error={errors.full_name?.message}
        >
          <InputWithIcon
            id="register-name"
            icon={<User size={18} aria-hidden />}
            autoComplete="name"
            placeholder={STRINGS.auth.register.fullNamePlaceholder}
            disabled={isPending}
            aria-invalid={Boolean(errors.full_name)}
            {...register("full_name")}
          />
        </AuthField>

        <AuthField
          label={STRINGS.auth.register.emailLabel}
          htmlFor="register-email"
          error={errors.email?.message}
        >
          <InputWithIcon
            id="register-email"
            icon={<Mail size={18} aria-hidden />}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            placeholder={STRINGS.auth.emailPlaceholder}
            disabled={isPending}
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </AuthField>

        <AuthField
          label={STRINGS.auth.register.phoneNumberLabel}
          htmlFor="register-phone"
          error={errors.msisdn?.message}
        >
          <Controller
            control={control}
            name="msisdn"
            render={({ field }) => (
              <PhoneInput
                id="register-phone"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={isPending}
                aria-invalid={Boolean(errors.msisdn)}
              />
            )}
          />
        </AuthField>

        <AuthField
          label={STRINGS.auth.register.passwordLabel}
          htmlFor="register-password"
          error={errors.password?.message}
        >
          <PasswordInput
            id="register-password"
            autoComplete="new-password"
            placeholder={STRINGS.auth.register.passwordLabel}
            disabled={isPending}
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
        </AuthField>

        <div className="flex flex-col gap-1">
          <Controller
            control={control}
            name="terms_accepted"
            render={({ field }) => (
              <label className="flex min-h-12 cursor-pointer items-center gap-3">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  aria-invalid={Boolean(errors.terms_accepted)}
                />
                <Text as="span" variant="body-small" className="flex-1 text-muted-foreground">
                  {STRINGS.auth.register.termsCheckboxLabel}
                </Text>
              </label>
            )}
          />
          {errors.terms_accepted?.message && (
            <Text variant="body-small" className="text-destructive">
              {errors.terms_accepted.message}
            </Text>
          )}
        </div>

        <button type="submit" className="hidden" tabIndex={-1} aria-hidden />
      </form>
    </AuthShell>
  );
}
