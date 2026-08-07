import { Suspense } from "react";
import type { Metadata } from "next";
import { LobbyFooter } from "@/components/lobby/lobby-footer";
import {
  CategoryScroller,
  PartnerLogoScroller,
} from "@/components/partners/partner-scrollers";
import { PartnersScreen } from "@/components/partners/partners-screen";
import { getCategoryGroups } from "@/lib/api/server/catalog";
import { requestTime } from "@/lib/api/server/request-time";
import { STRINGS } from "@/lib/strings";

export const metadata: Metadata = {
  title: STRINGS.partners.metaTitle,
  description: STRINGS.partners.metaDescription,
  alternates: { canonical: "/partners" },
};

/** The verticals people actually sell in, read from the catalogue. */
async function Categories() {
  const groups = await getCategoryGroups();
  return <CategoryScroller groups={groups ?? []} />;
}

/**
 * The footer prints the current year, which a build-time prerender refuses to
 * freeze. Holding just the footer back to request time keeps everything above
 * it, which is the whole pitch, in the prerendered HTML.
 */
async function Footer() {
  await requestTime();
  return <LobbyFooter />;
}

/**
 * The page a shop owner lands on from "Become a partner". Signing up still
 * happens on the vendor portal, which is a separate application; this page
 * exists because sending someone straight to a login form asks them to commit
 * before anyone has told them what they are committing to.
 */
export default function PartnersPage() {
  return (
    <PartnersScreen
      categoryScroller={
        <Suspense fallback={null}>
          <Categories />
        </Suspense>
      }
      partnerScroller={<PartnerLogoScroller />}
      footer={
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      }
    />
  );
}
