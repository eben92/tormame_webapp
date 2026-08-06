import { Suspense } from "react";
import type { Metadata } from "next";
import { LobbyScreen } from "@/components/lobby/lobby-screen";
import { LobbySkeleton } from "@/components/shell/route-skeletons";
import { getCategoryGroups } from "@/lib/api/server/catalog";
import { requestTime } from "@/lib/api/server/request-time";

export const metadata: Metadata = {
  title: "Food, groceries and more — delivered fast",
  description:
    "Browse restaurants, shops and events near you. Order in a few taps and track every delivery.",
  alternates: { canonical: "/lobby" },
};

/** See `requestTime` for why the render is held back to request time. */
async function LobbyContent() {
  await requestTime();
  const categories = await getCategoryGroups();
  return <LobbyScreen initialCategories={categories} />;
}

export default function LobbyPage() {
  return (
    <Suspense fallback={<LobbySkeleton />}>
      <LobbyContent />
    </Suspense>
  );
}
