import type { Metadata } from "next";
import { HelpScreen } from "@/components/profile/help-screen";

export const metadata: Metadata = { title: "Help" };

export default function HelpPage() {
  return <HelpScreen />;
}
