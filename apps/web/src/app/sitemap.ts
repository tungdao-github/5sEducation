import type { MetadataRoute } from "next";
import { docsPages } from "@/data/docs";
import { fetchBlogPosts, fetchCourses, fetchLearningPaths } from "@/services/api";

interface CourseSlug {
  slug: string;
}

interface BlogSlug {
  slug: string;
}

interface PathSlug {
  slug: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  let courses: CourseSlug[] = [];
  let posts: BlogSlug[] = [];
  let paths: PathSlug[] = [];

  try {
    courses = await fetchCourses();
  } catch {
    courses = [];
  }

  try {
    posts = await fetchBlogPosts({ take: 200 });
  } catch {
    posts = [];
  }

  try {
    paths = await fetchLearningPaths();
  } catch {
    paths = [];
  }

  const now = new Date();

  return [
    { url: baseUrl, lastModified: now },
    { url: `${baseUrl}/courses`, lastModified: now },
    { url: `${baseUrl}/blog`, lastModified: now },
    { url: `${baseUrl}/paths`, lastModified: now },
    { url: `${baseUrl}/compare`, lastModified: now },
    { url: `${baseUrl}/faq`, lastModified: now },
    { url: `${baseUrl}/policy/privacy`, lastModified: now },
    { url: `${baseUrl}/policy/terms`, lastModified: now },
    { url: `${baseUrl}/docs`, lastModified: now },
    ...docsPages.map((page) => ({
      url: `${baseUrl}/docs/${page.slug}`,
      lastModified: now,
    })),
    ...courses.map((course) => ({
      url: `${baseUrl}/courses/${course.slug}`,
      lastModified: now,
    })),
    ...posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: now,
    })),
    ...paths.map((path) => ({
      url: `${baseUrl}/paths/${path.slug}`,
      lastModified: now,
    })),
  ];
}

