import type { Metadata } from "next";
import { resolveApiAsset } from "@/lib/api";

export const SITE_NAME = "EduCourse";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/learning.jpg`;

export function absoluteUrl(path: string) {
  if (!path) return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function stripHtml(value?: string | null) {
  if (!value) return "";
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function trimText(value: string, max = 160) {
  const text = value.trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}...`;
}

export function buildMetadata(input: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  keywords?: string[];
  type?: "website" | "article";
}): Metadata {
  const title = input.title.trim();
  const description = trimText(stripHtml(input.description));
  const canonical = absoluteUrl(input.path);
  const image = input.image ? resolveApiAsset(input.image) || DEFAULT_OG_IMAGE : DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    keywords: input.keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: input.type ?? "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export function buildNoIndexMetadata(input: {
  title: string;
  description: string;
}): Metadata {
  return {
    title: input.title,
    description: input.description,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}