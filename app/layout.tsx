import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import { ENV } from "@/lib/env";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const TITLE = "TORMAME — Food & groceries delivered fast";
const DESCRIPTION =
  "Order food, groceries and more from restaurants and shops near you, delivered fast.";

export const metadata: Metadata = {
  // Lets every page declare canonical and Open Graph URLs as paths.
  metadataBase: new URL(ENV.SITE_URL),
  title: { default: TITLE, template: "%s · TORMAME" },
  description: DESCRIPTION,
  applicationName: "TORMAME",
  formatDetection: { telephone: false },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "TORMAME",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    locale: "en_GH",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF7" },
    { media: "(prefers-color-scheme: dark)", color: "#101613" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolage.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
