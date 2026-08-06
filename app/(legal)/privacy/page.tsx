import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/legal-document";
import { PRIVACY_DOCUMENT } from "@/lib/legal";

export const metadata: Metadata = {
  title: PRIVACY_DOCUMENT.title,
  description: PRIVACY_DOCUMENT.description,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <LegalDocumentPage document={PRIVACY_DOCUMENT} />;
}
