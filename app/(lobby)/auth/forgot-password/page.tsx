import type { Metadata } from "next";
import { ForgotPasswordScreen } from "@/components/auth/forgot-password-screen";

export const metadata: Metadata = {
  title: "Reset your password",
  description: "We'll text you a code to reset your password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordScreen />;
}
