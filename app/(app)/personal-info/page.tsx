import type { Metadata } from "next";
import { PersonalInfoScreen } from "@/components/profile/personal-info-screen";

export const metadata: Metadata = { title: "Personal info" };

export default function PersonalInfoPage() {
  return <PersonalInfoScreen />;
}
