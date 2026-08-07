import type { Metadata } from "next";
import { DeleteAccountScreen } from "@/components/profile/delete-account-screen";

export const metadata: Metadata = {
  title: "Delete your account",
  description:
    "Ask us to delete your Tormame account and the personal information we hold about you.",
};

export default function DeleteAccountPage() {
  return <DeleteAccountScreen />;
}
