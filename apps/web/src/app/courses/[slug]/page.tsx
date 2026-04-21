import type { Metadata } from "next";
import CourseDetail from "@/figma/pages/CourseDetail";
import { API_URL } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";

type CourseSeoDto = {
  title: string;
  shortDescription?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  slug: string;
  category?: {
    title?: string | null;
  } | null;
  instructorName?: string | null;
};

async function getCourseBySlug(slug: string): Promise<CourseSeoDto | null> {
  try {
    const res = await fetch(`${API_URL}/api/courses/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    return buildMetadata({
      title: "Khoa hoc",
      description: "Thong tin khoa hoc UX/UI Design va lo trinh hoc tap.",
      path: `/courses/${slug}`,
      type: "website",
    });
  }

  return buildMetadata({
    title: course.title,
    description:
      course.shortDescription ||
      course.description ||
      `Kham pha khoa hoc ${course.title} tren EduCourse.`,
    path: `/courses/${course.slug}`,
    image: course.thumbnailUrl,
    type: "website",
    keywords: [
      course.title,
      course.category?.title || "khoa hoc UX/UI",
      course.instructorName || "giang vien",
      "EduCourse",
    ],
  });
}

export default function Page() {
  return <CourseDetail />;
}
