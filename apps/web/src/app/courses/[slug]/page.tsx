import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { API_URL, resolveApiAsset } from "@/lib/api";
import { CourseActions } from "@/components/CourseActions";
import { CourseReviews } from "@/components/CourseReviews";
import { CourseCard, type CourseSummary } from "@/components/CourseCard";
import { CourseViewTracker } from "@/components/CourseViewTracker";
import { getServerLocale } from "@/lib/server-locale";
import { pickLocaleText } from "@/lib/i18n";

interface Lesson {
  id: number;
  title: string;
  durationMinutes: number;
}

interface Category {
  id: number;
  title: string;
  slug: string;
}

interface CourseDetail {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  outcome: string;
  requirements: string;
  price: number;
  effectivePrice?: number;
  originalPrice?: number | null;
  isFlashSaleActive?: boolean;
  flashSaleEndsAt?: string | null;
  thumbnailUrl: string;
  previewVideoUrl: string;
  level: string;
  language: string;
  averageRating: number;
  reviewCount: number;
  studentCount: number;
  lessons: Lesson[];
  category?: Category | null;
  createdAt?: string;
  updatedAt?: string;
}

type ChapterGroup = {
  key: string;
  title: string;
  lessons: Lesson[];
  totalMinutes: number;
};

function getChapterNumber(title: string): number | null {
  const numericMatch = title.match(/^\s*#?\s*(\d+)\s*[.\-]\s*\d+/);
  if (numericMatch) return Number(numericMatch[1]);
  const wordMatch = title.match(/^\s*(chapter|chuong)\s*(\d+)/i);
  if (wordMatch) return Number(wordMatch[2]);
  return null;
}

function buildChapters(lessons: Lesson[], chapterLabel: string, otherLabel: string): ChapterGroup[] {
  const grouped = new Map<number, ChapterGroup>();
  const other: ChapterGroup = { key: "other", title: otherLabel, lessons: [], totalMinutes: 0 };

  lessons.forEach((lesson) => {
    const lessonMinutes = lesson.durationMinutes || 0;
    const chapterNumber = getChapterNumber(lesson.title);
    if (chapterNumber === null || Number.isNaN(chapterNumber)) {
      other.lessons.push(lesson);
      other.totalMinutes += lessonMinutes;
      return;
    }

    const existing = grouped.get(chapterNumber);
    if (existing) {
      existing.lessons.push(lesson);
      existing.totalMinutes += lessonMinutes;
      return;
    }

    grouped.set(chapterNumber, {
      key: String(chapterNumber),
      title: `${chapterLabel} ${chapterNumber}`,
      lessons: [lesson],
      totalMinutes: lessonMinutes,
    });
  });

  const chapters = Array.from(grouped.values()).sort((a, b) => Number(a.key) - Number(b.key));
  if (other.lessons.length) chapters.push(other);
  return chapters;
}

function formatDuration(totalMinutes: number, t: (en: string, vi: string) => string) {
  if (totalMinutes <= 0) {
    return `0 ${t("mins", "phut")}`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) {
    return `${minutes} ${t("mins", "phut")}`;
  }

  if (minutes === 0) {
    return `${hours} ${t("hours", "gio")}`;
  }

  return `${hours} ${t("hours", "gio")} ${minutes} ${t("mins", "phut")}`;
}

async function getCourse(slug: string): Promise<CourseDetail | null> {
  try {
    const res = await fetch(`${API_URL}/api/courses/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getRelated(slug: string): Promise<CourseSummary[]> {
  try {
    const res = await fetch(`${API_URL}/api/courses/${slug}/related`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) {
    return {
      title: "Course not found",
    };
  }

  const imageUrl = resolveApiAsset(course.thumbnailUrl);

  return {
    title: course.title,
    description: course.shortDescription,
    openGraph: {
      title: course.title,
      description: course.shortDescription,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getServerLocale();
  const t = (en: string, vi: string) => pickLocaleText(locale, en, vi);

  const { slug } = await params;
  const [course, relatedCourses] = await Promise.all([getCourse(slug), getRelated(slug)]);

  if (!course) {
    notFound();
  }

  const totalMinutes = course.lessons.reduce((sum, lesson) => sum + (lesson.durationMinutes || 0), 0);
  const chapterLabel = t("Chapter", "Chuong");
  const otherLabel = t("Other lessons", "Bai khac");
  const chapters = buildChapters(course.lessons, chapterLabel, otherLabel);
  const totalDurationLabel = formatDuration(totalMinutes, t);
  const curriculumSummary = `${chapters.length} ${t("chapters", "chuong")} - ${course.lessons.length} ${t(
    "lessons",
    "bai hoc"
  )} - ${totalDurationLabel} ${t("total", "tong")}`;
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(course.effectivePrice ?? course.price);
  const originalPrice = course.originalPrice ?? null;
  const isFlashSale = Boolean(course.isFlashSaleActive && originalPrice);
  const imageUrl = resolveApiAsset(course.thumbnailUrl) || "/images/learning.jpg";
  const averageRating = course.averageRating ?? 0;
  const reviewCount = course.reviewCount ?? 0;
  const studentCount = course.studentCount ?? 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12 fade-in">
      <CourseViewTracker courseId={course.id} />
      <div className="mb-10 space-y-3">
        <Link href="/courses" className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {t("Courses", "Khoa hoc")}
        </Link>
        <h1 className="section-title text-4xl font-semibold text-emerald-950 md:text-5xl">{course.title}</h1>
        <p className="text-lg text-emerald-800/70">{course.shortDescription}</p>
        <div className="flex flex-wrap items-center gap-3 text-sm text-emerald-800/70">
          {course.category?.title && <span>{course.category.title}</span>}
          <span>{course.level || t("Beginner", "Co ban")}</span>
          <span>{course.language || t("English", "Tieng Anh")}</span>
          <span>
            {course.lessons.length} {t("lessons", "bai hoc")}
          </span>
          <span>
            {studentCount} {t("students", "hoc vien")}
          </span>
          <span>
            {averageRating.toFixed(1)} * ({reviewCount})
          </span>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-8">
          <section className="glass-card rounded-3xl p-6">
            <h2 className="section-title text-2xl font-semibold text-emerald-950">
              {t("What you will learn", "Ban se hoc duoc")}
            </h2>
            <p className="mt-3 text-sm text-emerald-800/70">
              {course.outcome || t("Build practical skills.", "Xay dung ky nang thuc hanh.")}
            </p>
          </section>

          <section className="glass-card rounded-3xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="section-title text-2xl font-semibold text-emerald-950">
                {t("Course curriculum", "Noi dung khoa hoc")}
              </h2>
              <span className="text-sm text-emerald-800/70">
                {curriculumSummary}
              </span>
            </div>
            <div className="mt-4 space-y-4">
              {chapters.map((chapter, index) => (
                <details
                  key={chapter.key}
                  className="group rounded-3xl border border-emerald-100 bg-white/70 p-4"
                  open={index < 2}
                >
                  <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-emerald-950">{chapter.title}</span>
                    <span className="text-xs text-emerald-800/70">
                      {chapter.lessons.length} {t("lessons", "bai hoc")} - {formatDuration(chapter.totalMinutes, t)}
                    </span>
                  </summary>
                  <ul className="mt-3 space-y-2">
                    {chapter.lessons.map((lesson) => (
                      <li key={lesson.id} className="flex items-center justify-between rounded-2xl bg-white/90 p-3">
                        <span className="text-sm font-medium text-emerald-950">{lesson.title}</span>
                        <span className="text-xs text-emerald-800/70">
                          {lesson.durationMinutes} {t("mins", "phut")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </section>

          <section className="glass-card rounded-3xl p-6">
            <h2 className="section-title text-2xl font-semibold text-emerald-950">
              {t("Requirements", "Yeu cau")}
            </h2>
            <p className="mt-3 text-sm text-emerald-800/70">
              {course.requirements || t("No prerequisites.", "Khong yeu cau kien thuc truoc.")}
            </p>
          </section>

          <section className="glass-card rounded-3xl p-6">
            <h2 className="section-title text-2xl font-semibold text-emerald-950">
              {t("About this course", "Gioi thieu khoa hoc")}
            </h2>
            <p className="mt-3 text-sm text-emerald-800/70">{course.description}</p>
          </section>

          {relatedCourses.length > 0 && (
            <section className="glass-card rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="section-title text-2xl font-semibold text-emerald-950">
                  {t("Related courses", "Khoa hoc lien quan")}
                </h2>
              </div>
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                {relatedCourses.map((item) => (
                  <CourseCard key={item.id} course={item} locale={locale} />
                ))}
              </div>
            </section>
          )}

          <CourseReviews courseId={course.id} courseSlug={course.slug} />
        </div>

        <aside className="space-y-6">
          <div className="glass-card rounded-3xl p-6 shadow-sm">
            <img src={imageUrl} alt={course.title} className="h-48 w-full rounded-2xl object-cover" />
            <div className="mt-5 flex items-baseline justify-between">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-semibold text-emerald-950">{formattedPrice}</span>
                {isFlashSale && originalPrice ? (
                  <span className="text-sm font-semibold text-emerald-700/60 line-through">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(originalPrice)}
                  </span>
                ) : null}
              </div>
              <span className="text-xs text-emerald-800/70">{t("One-time payment", "Thanh toan mot lan")}</span>
            </div>
            {isFlashSale && course.flashSaleEndsAt ? (
              <p className="mt-2 text-xs font-semibold text-amber-600">
                {t("Flash sale ends:", "Giam gia ket thuc:")}{" "}
                {new Date(course.flashSaleEndsAt).toLocaleString()}
              </p>
            ) : null}
            <CourseActions courseId={course.id} courseSlug={course.slug} />
            <Link
              href={`/learn/${course.slug}`}
              className="mt-3 inline-flex w-full justify-center rounded-full border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-900"
            >
              {t("Start learning", "Bat dau hoc")}
            </Link>
            <div className="mt-6 space-y-2 text-xs text-emerald-800/70">
              <p>{t("Includes:", "Bao gom:")}</p>
              <ul className="space-y-1">
                <li>{t("Lifetime access", "Truy cap tron doi")}</li>
                <li>{t("Downloadable resources", "Tai nguyen co the tai ve")}</li>
                <li>{t("Certificate of completion", "Chung chi hoan thanh")}</li>
              </ul>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-emerald-950">
              {t("Need help deciding?", "Can tu van them?")}
            </h3>
            <p className="mt-2 text-sm text-emerald-800/70">
              {t(
                "Talk to a mentor and build a personalized learning plan.",
                "Trao doi voi mentor va len lo trinh hoc tap ca nhan."
              )}
            </p>
            <Link
              href="/register"
              className="mt-4 inline-flex rounded-full border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-900"
            >
              {t("Book a consult", "Dat lich tu van")}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
