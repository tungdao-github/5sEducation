import "./globals.css";

import type { Metadata } from "next";
import { Providers } from "./providers";
import { AppChrome } from "@/components/AppChrome";
import { GoogleOneTap } from "@/components/GoogleOneTap";
import { getServerLocale } from "@/lib/server-locale";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "EduCourse",
    template: "%s | EduCourse",
  },
  description:
    "Nen tang hoc UX/UI Design online voi khoa hoc thuc chien, lo trinh hoc tap ro rang va blog chuyen sau.",
  keywords: [
    "EduCourse",
    "UX/UI Design",
    "khoa hoc online",
    "lo trinh hoc tap",
    "giang vien",
    "blog UX/UI",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "EduCourse",
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
        alt: "EduCourse",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EduCourse",
    description:
      "Hoc UX/UI Design chuyen nghiep voi cac khoa hoc thuc chien va blog chuyen sau.",
    images: [DEFAULT_OG_IMAGE],
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
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      style={{
        ["--font-body" as string]:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        ["--font-display" as string]:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <body className="page-shell">
        <Providers>
          <GoogleOneTap />
          <AppChrome>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  );
}
