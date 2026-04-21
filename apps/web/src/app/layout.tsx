import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import { AppChrome } from "@/components/AppChrome";
import { GoogleOneTap } from "@/components/GoogleOneTap";
import { getServerLocale } from "@/lib/server-locale";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "EduCourse - Nen tang hoc truc tuyen hang dau",
    template: "%s | EduCourse",
  },
  description:
    "Nen tang hoc UX/UI Design online voi khoa hoc thuc chien, lo trinh hoc tap ro rang va blog chuyen sau. Hoc tu cac chuyen gia hang dau.",
  keywords: [
    "EduCourse",
    "UX/UI Design",
    "khoa hoc online",
    "lo trinh hoc tap",
    "giang vien",
    "blog UX/UI",
    "hoc thiet ke",
    "design course",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "EduCourse - Nen tang hoc truc tuyen hang dau",
    description:
      "Hoc UX/UI Design chuyen nghiep voi cac khoa hoc thuc chien, blog chuyen sau va lo trinh hoc tap duoc tuyen chon.",
    type: "website",
    url: siteUrl,
    siteName: "EduCourse",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "EduCourse - Nen tang hoc truc tuyen",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EduCourse - Nen tang hoc truc tuyen hang dau",
    description:
      "Hoc UX/UI Design chuyen nghiep voi cac khoa hoc thuc chien va blog chuyen sau.",
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
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
      className={`${inter.variable} ${jetbrainsMono.variable} bg-background`}
    >
      <body className="page-shell font-sans antialiased">
        <Providers>
          <GoogleOneTap />
          <AppChrome>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  );
}
