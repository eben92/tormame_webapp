import { BrandBar } from "@/components/shell/brand-bar";

/**
 * Policy pages sit outside the app shell: they are public documents reached
 * from the footer, a search result or a shared link, so they carry the brand bar
 * and nothing else — no tab bar, no cart, no address picker.
 */
export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <BrandBar href="/" />
      {children}
    </div>
  );
}
