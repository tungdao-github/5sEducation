import type { Metadata } from "next";
import CourseDetail from "@/figma/pages/CourseDetail";
import { API_URL } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";

type CourseSeoDto = {
  id: number;
  title: string;
  shortDescription?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  slug?: string | null;
  category?: {
    title?: string | null;
  } | null;
  instructorName?: string | null;
};

async function getCourse(id: string): Promise<CourseSeoDto | null> {
  try {
    const bySlug = await fetch(`${API_URL}/api/courses/${id}`, { cache: "no-store" });
    if (bySlug.ok) {
      return bySlug.json();
    }
  } catch {
    // ignore and try by id
  }

  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) return null;

  try {
    const byId = await fetch(`${API_URL}/api/courses/by-id/${numericId}`, { cache: "no-store" });
    if (!byId.ok) return null;
    return byId.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const course = await getCourse(id);

  if (!course) {
    return buildMetadata({
      title: "Khoa hoc",
      description: "Thong tin khoa hoc UX/UI Design va lo trinh hoc tap.",
      path: `/course/${id}`,
      type: "website",
    });
  }

  return buildMetadata({
    title: course.title,
    description:
      course.shortDescription ||
      course.description ||
      `Kham pha khoa hoc ${course.title} tren EduCourse.`,
    path: course.slug ? `/courses/${course.slug}` : `/course/${id}`,
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
