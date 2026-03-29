import type { MetadataRoute } from "next";
import { API_URL } from "@/lib/api";

interface CourseSlug {
  slug: string;
}

interface BlogSlug {
  slug: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  let courses: CourseSlug[] = [];
  let posts: BlogSlug[] = [];

  try {
    const res = await fetch(`${API_URL}/api/courses`, { cache: "no-store" });
    if (res.ok) {
      courses = await res.json();
    }
  } catch {
    courses = [];
  }

  try {
    const res = await fetch(`${API_URL}/api/blog/posts?take=200`, { cache: "no-store" });
    if (res.ok) {
      posts = await res.json();
    }
  } catch {
    posts = [];
  }

  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: now,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: now,
    },
    ...courses.map((course) => ({
      url: `${baseUrl}/courses/${course.slug}`,
      lastModified: now,
    })),
    ...posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: now,
    })),
  ];
}
