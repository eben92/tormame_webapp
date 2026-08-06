import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/legal-document";
import { COOKIES_DOCUMENT } from "@/lib/legal";

export const metadata: Metadata = {
  title: COOKIES_DOCUMENT.title,
  description: COOKIES_DOCUMENT.description,
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return <LegalDocumentPage document={COOKIES_DOCUMENT} />;
}
