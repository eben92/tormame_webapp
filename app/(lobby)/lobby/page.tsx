import type { Metadata } from "next";
import { LobbyScreen } from "@/components/lobby/lobby-screen";

export const metadata: Metadata = {
  title: "Food, groceries and more — delivered fast",
  description:
    "Browse restaurants, shops and events near you. Order in a few taps and track every delivery.",
};

export default function LobbyPage() {
  return <LobbyScreen />;
}
