"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AuthField, AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { PasswordInput } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import {
  useConfirmPasswordReset,
  useResendPasswordResetOTP,
} from "@/lib/api/services/auth";
import { STRINGS } from "@/lib/strings";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 120;
const INITIAL_COOLDOWN = 60;

const schema = z
  .object({
    otp: z
      .string()
      .length(OTP_LENGTH, STRINGS.auth.forgotPassword.reset.otpRequiredError),
    new_password: z
      .string()
      .min(6, STRINGS.auth.forgotPassword.reset.passwordRules),
    confirm_new_password: z
      .string()
      .min(6, STRINGS.auth.forgotPassword.reset.confirmPasswordRequiredError),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: STRINGS.auth.forgotPassword.reset.passwordMismatchError,
    path: ["confirm_new_password"],
  });

type FormData = z.infer<typeof schema>;

/** Counts down once per second from `seconds`, restartable when a new code is sent. */
function useCountdown(initial: number) {
  const [remaining, setRemaining] = React.useState(initial);

  React.useEffect(() => {
    if (remaining <= 0) return;
    const timer = setTimeout(() => setRemaining((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);

  return [remaining, setRemaining] as const;
}

export function ResetPasswordScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const msisdn = searchParams.get("msisdn") ?? "";

  const confirmReset = useConfirmPasswordReset();
  const resendOtp = useResendPasswordResetOTP();
  const [countdown, setCountdown] = useCountdown(INITIAL_COOLDOWN);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { otp: "", new_password: "", confirm_new_password: "" },
  });

  const isPending = confirmReset.isPending;

  const onSubmit = (data: FormData) => {
    toast.promise(
      confirmReset.mutateAsync({
        otp: data.otp,
        new_password: data.new_password,
        msisdn,
      }),
      {
        loading: STRINGS.auth.forgotPassword.reset.saving,
        success: () => {
          router.replace("/auth/signin");
          return STRINGS.auth.forgotPassword.reset.savedToast;
        },
        error: STRINGS.auth.forgotPassword.reset.saveErrorToast,
      },
    );
  };

  const handleResend = () => {
    if (countdown > 0 || resendOtp.isPending) return;
    toast.promise(resendOtp.mutateAsync(msisdn), {
      loading: STRINGS.auth.forgotPassword.resendingToast,
      success: () => {
        setCountdown(RESEND_COOLDOWN);
        return STRINGS.auth.forgotPassword.resendSuccessToast;
      },
      error: STRINGS.auth.forgotPassword.resendErrorToast,
    });
  };

  return (
    <AuthShell
      title={STRINGS.auth.forgotPassword.reset.title}
      subtitle={STRINGS.auth.forgotPassword.reset.subtitle}
      dismiss={{ kind: "back", onDismiss: () => router.back() }}
      error={confirmReset.error}
      footer={
        <>
          <Button
            size="lg"
            isLoading={isPending}
            dimmed={isPending}
            onClick={handleSubmit(onSubmit)}
          >
            {isPending
              ? STRINGS.auth.forgotPassword.reset.saving
              : STRINGS.auth.forgotPassword.reset.saveCta}
          </Button>
          <Button variant="ghost" onClick={() => router.replace("/auth/register")}>
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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <AuthField
          label={STRINGS.auth.forgotPassword.reset.otpLabel}
          error={errors.otp?.message}
        >
          <Controller
            control={control}
            name="otp"
            render={({ field }) => (
              <InputOTP
                maxLength={OTP_LENGTH}
                value={field.value}
                onChange={field.onChange}
                disabled={isPending || resendOtp.isPending}
                aria-invalid={Boolean(errors.otp)}
                aria-label={STRINGS.auth.forgotPassword.reset.otpLabel}
              >
                <InputOTPGroup>
                  {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      aria-invalid={Boolean(errors.otp)}
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            )}
          />

          <div className="flex items-center gap-1">
            <Text variant="body-small" className="text-muted-foreground">
              {STRINGS.auth.forgotPassword.resendPrompt}
            </Text>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || isPending || resendOtp.isPending}
              className="font-bold text-primary"
            >
              {countdown > 0
                ? STRINGS.auth.forgotPassword.resendCtaCountdown(countdown)
                : STRINGS.auth.forgotPassword.resendCta}
            </Button>
          </div>
        </AuthField>

        <AuthField
          label={STRINGS.auth.forgotPassword.reset.newPasswordLabel}
          htmlFor="reset-new-password"
          error={errors.new_password?.message}
        >
          <Text variant="body-small" className="text-muted-foreground">
            {STRINGS.auth.forgotPassword.reset.passwordRules}
          </Text>
          <PasswordInput
            id="reset-new-password"
            autoComplete="new-password"
            placeholder={STRINGS.auth.forgotPassword.reset.newPasswordLabel}
            disabled={isPending}
            aria-invalid={Boolean(errors.new_password)}
            {...register("new_password")}
          />
        </AuthField>

        <AuthField
          label={STRINGS.auth.forgotPassword.reset.confirmPasswordLabel}
          htmlFor="reset-confirm-password"
          error={errors.confirm_new_password?.message}
        >
          <PasswordInput
            id="reset-confirm-password"
            autoComplete="new-password"
            placeholder={STRINGS.auth.forgotPassword.reset.confirmPasswordLabel}
            disabled={isPending}
            aria-invalid={Boolean(errors.confirm_new_password)}
            {...register("confirm_new_password")}
          />
        </AuthField>

        <button type="submit" className="hidden" tabIndex={-1} aria-hidden />
      </form>
    </AuthShell>
  );
}
