import type { Metadata } from "next";
import { SettingsScreen } from "@/components/profile/settings-screen";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return <SettingsScreen />;
}
