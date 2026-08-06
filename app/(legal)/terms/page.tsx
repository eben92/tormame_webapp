import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/legal-document";
import { TERMS_DOCUMENT } from "@/lib/legal";

export const metadata: Metadata = {
  title: TERMS_DOCUMENT.title,
  description: TERMS_DOCUMENT.description,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <LegalDocumentPage document={TERMS_DOCUMENT} />;
}
