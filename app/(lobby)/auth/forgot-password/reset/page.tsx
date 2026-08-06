import { Suspense } from "react";
import type { Metadata } from "next";
import { ResetPasswordScreen } from "@/components/auth/reset-password-screen";

export const metadata: Metadata = {
  title: "Create a new password",
  description: "Enter your code and choose a new password.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordScreen />
    </Suspense>
  );
}
