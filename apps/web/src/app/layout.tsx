import "./globals.css";

import type { Metadata } from "next";
import { Providers } from "./providers";
import { GoogleOneTap } from "@/components/GoogleOneTap";
import Header from "@/figma/components/Header";
import Footer from "@/figma/components/Footer";
import AuthModal from "@/figma/components/AuthModal";
import ChatWidget from "@/figma/components/ChatWidget";
import { getServerLocale } from "@/lib/server-locale";

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
      style={{
        ["--font-body" as string]:
          '"Manrope", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
        ["--font-display" as string]:
          '"Space Grotesk", "Trebuchet MS", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <body className="page-shell">
        <Providers>
          <GoogleOneTap />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <AuthModal />
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
