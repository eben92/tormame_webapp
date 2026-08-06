"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthField, AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import {
  PhoneInput,
  isValidGhanaPhoneNumber,
} from "@/components/ui/phone-input";
import { Text } from "@/components/ui/text";
import { useForgottenPassword } from "@/lib/api/services/auth";
import { STRINGS } from "@/lib/strings";

const schema = z.object({
  msisdn: z.string().refine(isValidGhanaPhoneNumber, STRINGS.auth.invalidPhone),
});

type FormData = z.infer<typeof schema>;

export function ForgotPasswordScreen() {
  const router = useRouter();
  const { mutate, isPending, error } = useForgottenPassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { msisdn: "" },
  });

  const onSubmit = (data: FormData) => {
    mutate(data.msisdn, {
      onSuccess: () => {
        router.push(
          `/auth/forgot-password/reset?msisdn=${encodeURIComponent(data.msisdn)}`,
        );
      },
    });
  };

  return (
    <AuthShell
      title={STRINGS.auth.forgotPassword.title}
      subtitle={STRINGS.auth.forgotPassword.subtitle}
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
              ? STRINGS.auth.forgotPassword.sendingCode
              : STRINGS.auth.forgotPassword.sendCodeCta}
          </Button>
          <Button variant="ghost" onClick={() => router.push("/auth/register")}>
            <Text as="span" variant="body-small">
              {STRINGS.auth.signin.noAccountPrompt}{" "}
              <Text
                as="span"
                variant="body-small"
                className="font-bold text-primary"
              >
                {STRINGS.auth.signin.createAccountCta}
              </Text>
            </Text>
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthField
          label={STRINGS.auth.forgotPassword.phoneNumberLabel}
          htmlFor="forgot-phone"
          error={errors.msisdn?.message}
        >
          <Controller
            control={control}
            name="msisdn"
            render={({ field }) => (
              <PhoneInput
                id="forgot-phone"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={isPending}
                aria-invalid={Boolean(errors.msisdn)}
              />
            )}
          />
        </AuthField>
        <button type="submit" className="hidden" tabIndex={-1} aria-hidden />
      </form>
    </AuthShell>
  );
}
