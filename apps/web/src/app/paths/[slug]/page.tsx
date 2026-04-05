import Link from "next/link";
import { API_URL, resolveApiAsset } from "@/lib/api";
import { getServerLocale } from "@/lib/server-locale";
import { pickLocaleText } from "@/lib/i18n";

type PathSection = {
  id: number;
  learningPathId: number;
  title: string;
  description: string;
  sortOrder: number;
};

type PathCourse = {
  id: number;
  learningPathId: number;
  learningPathSectionId: number | null;
  courseId: number;
  courseTitle: string;
  courseSlug: string;
  courseThumbnailUrl: string;
  courseLevel: string;
  courseLanguage: string;
  sortOrder: number;
  isRequired: boolean;
};

type PathDetail = {
  id: number;
  title: string;
  slug: string;
  description: string;
  level: string;
  thumbnailUrl: string;
  estimatedHours: number;
  courseCount: number;
  sections: PathSection[];
  courses: PathCourse[];
};

async function getPath(slug: string): Promise<PathDetail | null> {
  try {
    const res = await fetch(`${API_URL}/api/learning-paths/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function PathDetailPage({ params }: { params: { slug: string } }) {
  const locale = await getServerLocale();
  const t = (en: string, vi: string) => pickLocaleText(locale, en, vi);
  const path = await getPath(params.slug);

  if (!path) {
    return (
      <div className="section-shell py-16 text-center text-sm text-emerald-800/70">
        {t("Learning path not found.", "Khong tim thay lo trinh.")}
      </div>
    );
  }

  const sections = [...path.sections].sort((a, b) => a.sortOrder - b.sortOrder);
  const courses = [...path.courses].sort((a, b) => a.sortOrder - b.sortOrder);
  const firstCourse = courses[0];

  const coursesBySection = sections.map((section) => ({
    section,
    items: courses.filter((course) => course.learningPathSectionId === section.id),
  }));

  const ungroupedCourses = courses.filter(
    (course) => !course.learningPathSectionId || !sections.some((s) => s.id === course.learningPathSectionId)
  );

  return (
    <div className="section-shell space-y-10 py-12 fade-in">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-4">
          <Link href="/paths" className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            {t("Learning paths", "Lo trinh hoc tap")}
          </Link>
          <h1 className="section-title text-4xl font-semibold text-emerald-950">{path.title}</h1>
          <p className="text-sm text-emerald-800/70">{path.description}</p>
          <div className="flex flex-wrap gap-3 text-xs font-semibold text-emerald-900">
            <span className="rounded-full border border-[color:var(--stroke)] px-3 py-1">{path.level || t("Beginner", "Co ban")}</span>
            <span className="rounded-full border border-[color:var(--stroke)] px-3 py-1">
              {path.courseCount} {t("courses", "khoa hoc")}
            </span>
            {path.estimatedHours > 0 && (
              <span className="rounded-full border border-[color:var(--stroke)] px-3 py-1">{path.estimatedHours}h</span>
            )}
          </div>
          {firstCourse && (
            <Link
              href={`/courses/${firstCourse.courseSlug}`}
              className="inline-flex rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white"
            >
              {t("Start learning", "Bat dau hoc")}
            </Link>
          )}
        </div>
        <div className="surface-card w-full max-w-sm rounded-3xl p-4">
          <img
            src={resolveApiAsset(path.thumbnailUrl)}
            alt={path.title}
            className="h-56 w-full rounded-2xl object-cover"
          />
        </div>
      </div>

      <section className="space-y-6">
        <h2 className="section-title text-2xl font-semibold text-emerald-950">
          {t("Roadmap", "Lo trinh")}
        </h2>

        {coursesBySection.map(({ section, items }) => (
          <div key={section.id} className="surface-card space-y-4 rounded-3xl p-6">
            <div>
              <h3 className="text-lg font-semibold text-emerald-950">{section.title}</h3>
              {section.description && <p className="text-sm text-emerald-800/70">{section.description}</p>}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.courseSlug}`}
                  className="flex gap-3 rounded-2xl border border-[color:var(--stroke)] bg-white/70 p-3"
                >
                  <img
                    src={resolveApiAsset(course.courseThumbnailUrl)}
                    alt={course.courseTitle}
                    className="h-16 w-20 rounded-xl object-cover"
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-emerald-950">{course.courseTitle}</p>
                    <p className="text-xs text-emerald-700/70">{course.courseLevel}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {ungroupedCourses.length > 0 && (
          <div className="surface-card space-y-4 rounded-3xl p-6">
            <div>
              <h3 className="text-lg font-semibold text-emerald-950">
                {t("Additional courses", "Khoa hoc bo sung")}
              </h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {ungroupedCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.courseSlug}`}
                  className="flex gap-3 rounded-2xl border border-[color:var(--stroke)] bg-white/70 p-3"
                >
                  <img
                    src={resolveApiAsset(course.courseThumbnailUrl)}
                    alt={course.courseTitle}
                    className="h-16 w-20 rounded-xl object-cover"
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-emerald-950">{course.courseTitle}</p>
                    <p className="text-xs text-emerald-700/70">{course.courseLevel}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

