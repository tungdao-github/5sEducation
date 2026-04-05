import "./globals.css";

import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { GoogleOneTap } from "@/components/GoogleOneTap";
import { SupportChatWidget } from "@/components/SupportChatWidget";
import { getServerLocale } from "@/lib/server-locale";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "5S EDUCATION",
    template: "%s | 5S EDUCATION",
  },
  description: "Modern online learning for practical, job-ready skills.",
  keywords: [
    "online courses",
    "learning platform",
    "skills",
    "certification",
    "mentorship",
  ],
  openGraph: {
    title: "5S EDUCATION",
    description: "Build real-world skills with curated learning paths.",
    type: "website",
    url: siteUrl,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getServerLocale();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${bodyFont.variable} ${displayFont.variable}`}
    >
      <body className="page-shell">
        <Providers>
          <GoogleOneTap />
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <SupportChatWidget />
        </Providers>
      </body>
    </html>
  );
}
