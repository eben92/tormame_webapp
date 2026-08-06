import type { Metadata } from "next";
import { SignInScreen } from "@/components/auth/signin-screen";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to track your orders and reorder in seconds.",
};

export default function SignInPage() {
  return <SignInScreen />;
}
