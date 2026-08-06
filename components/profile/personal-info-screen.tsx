"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AuthField } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { focusRing, pressableScale } from "@/components/ui/pressable";
import { ApiError } from "@/lib/api/errors";
import {
  useChangePassword,
  useUpdateProfile,
} from "@/lib/api/services/profile";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user";

const profileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, STRINGS.profile.personalInfo.nameTooShort),
});

const passwordSchema = z
  .object({
    current_password: z
      .string()
      .min(1, STRINGS.profile.personalInfo.currentPasswordRequired),
    new_password: z
      .string()
      .min(8, STRINGS.profile.personalInfo.passwordTooShort),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: STRINGS.profile.personalInfo.passwordsMismatch,
    path: ["confirm_password"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export function PersonalInfoScreen() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: "" },
    // `values` (not `defaultValues`) because the persisted session hydrates
    // after the first render — defaults would latch onto the empty pre-hydration
    // value and never catch up.
    values: { full_name: user?.profile.name ?? "" },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const onSaveProfile = (data: ProfileFormData) => {
    updateProfile.mutate(data, {
      onSuccess: () =>
        toast.success(STRINGS.profile.personalInfo.profileUpdatedToast),
      onError: () =>
        toast.error(STRINGS.profile.personalInfo.profileUpdateErrorToast),
    });
  };

  const onChangePassword = (data: PasswordFormData) => {
    changePassword.mutate(
      {
        current_password: data.current_password,
        new_password: data.new_password,
      },
      {
        onSuccess: () => {
          toast.success(STRINGS.profile.personalInfo.passwordChangedToast);
          passwordForm.reset();
        },
        onError: (error) => {
          // A 400/401 here means the current password was wrong — name the
          // field rather than showing a generic failure.
          if (error instanceof ApiError && error.status < 500) {
            passwordForm.setError("current_password", {
              message: STRINGS.profile.personalInfo.currentPasswordIncorrect,
            });
            return;
          }
          toast.error(STRINGS.profile.personalInfo.passwordChangeErrorToast);
        },
      },
    );
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-border bg-background px-4 pt-3 pb-3 md:px-8">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label={STRINGS.common.back}
          className={cn(
            "flex size-12 items-center justify-center rounded-full bg-muted text-foreground",
            pressableScale,
            focusRing,
          )}
        >
          <ArrowLeft size={20} aria-hidden />
        </button>
        <Text variant="h3">{STRINGS.profile.menu.personalInfo}</Text>
      </div>

      <div className="mx-auto flex w-full max-w-[40rem] flex-1 flex-col gap-8 p-4 md:px-8 md:py-8">
        <form
          onSubmit={profileForm.handleSubmit(onSaveProfile)}
          className="flex flex-col gap-4"
          noValidate
        >
          <Text variant="caption">
            {STRINGS.profile.personalInfo.profileDetailsTitle}
          </Text>

          <AuthField
            label={STRINGS.profile.personalInfo.fullNameLabel}
            htmlFor="profile-name"
            error={profileForm.formState.errors.full_name?.message}
          >
            <Input
              id="profile-name"
              autoComplete="name"
              aria-invalid={Boolean(profileForm.formState.errors.full_name)}
              {...profileForm.register("full_name")}
            />
          </AuthField>

          <AuthField
            label={STRINGS.profile.personalInfo.emailLabel}
            htmlFor="profile-email"
          >
            <Input
              id="profile-email"
              value={user?.profile.email ?? ""}
              disabled
              readOnly
            />
          </AuthField>

          <AuthField
            label={STRINGS.profile.personalInfo.phoneLabel}
            htmlFor="profile-phone"
          >
            <Input
              id="profile-phone"
              value={user?.profile.msisdn ?? ""}
              disabled
              readOnly
            />
          </AuthField>

          <Button
            type="submit"
            size="lg"
            isLoading={updateProfile.isPending}
            className="mt-2"
          >
            {updateProfile.isPending
              ? STRINGS.profile.personalInfo.savingChanges
              : STRINGS.profile.personalInfo.saveChanges}
          </Button>
        </form>

        <form
          onSubmit={passwordForm.handleSubmit(onChangePassword)}
          className="flex flex-col gap-4"
          noValidate
        >
          <Text variant="caption">
            {STRINGS.profile.personalInfo.changePasswordTitle}
          </Text>

          <AuthField
            label={STRINGS.profile.personalInfo.currentPasswordLabel}
            htmlFor="current-password"
            error={passwordForm.formState.errors.current_password?.message}
          >
            <PasswordInput
              id="current-password"
              autoComplete="current-password"
              aria-invalid={Boolean(
                passwordForm.formState.errors.current_password,
              )}
              {...passwordForm.register("current_password")}
            />
          </AuthField>

          <AuthField
            label={STRINGS.profile.personalInfo.newPasswordLabel}
            htmlFor="new-password"
            error={passwordForm.formState.errors.new_password?.message}
          >
            <PasswordInput
              id="new-password"
              autoComplete="new-password"
              aria-invalid={Boolean(passwordForm.formState.errors.new_password)}
              {...passwordForm.register("new_password")}
            />
          </AuthField>

          <AuthField
            label={STRINGS.profile.personalInfo.confirmNewPasswordLabel}
            htmlFor="confirm-password"
            error={passwordForm.formState.errors.confirm_password?.message}
          >
            <PasswordInput
              id="confirm-password"
              autoComplete="new-password"
              aria-invalid={Boolean(
                passwordForm.formState.errors.confirm_password,
              )}
              {...passwordForm.register("confirm_password")}
            />
          </AuthField>

          <Button
            type="submit"
            size="lg"
            variant="outline"
            isLoading={changePassword.isPending}
            className="mt-2 text-primary"
          >
            {changePassword.isPending
              ? STRINGS.profile.personalInfo.changingPassword
              : STRINGS.profile.personalInfo.changePasswordCta}
          </Button>
        </form>
      </div>
    </div>
  );
}
