import type { Metadata } from "next";
import { RegisterScreen } from "@/components/auth/register-screen";

export const metadata: Metadata = {
  title: "Create account",
  description: "Just a few details and you can start ordering.",
};

export default function RegisterPage() {
  return <RegisterScreen />;
}
