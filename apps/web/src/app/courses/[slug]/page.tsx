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

function splitIntoItems(text: string) {
  return text
    .split(/\r?\n|\u2022|\|/g)
    .map((item) => item.replace(/^\s*[-\u2013\u2022]\s*/, "").trim())
    .filter((item) => item.length > 0);
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
  const levelLabel = course.level || t("Beginner", "Co ban");
  const languageLabel = course.language || t("English", "Tieng Anh");
  const metaBadges = [course.category?.title, levelLabel, languageLabel].filter(Boolean) as string[];
  if (isFlashSale) {
    metaBadges.push(t("Flash sale", "Giam gia nhanh"));
  }
  const outcomeItems = splitIntoItems(course.outcome || "");
  const requirementItems = splitIntoItems(course.requirements || "");
  const lastUpdated = course.updatedAt || course.createdAt;
  const lastUpdatedLabel = lastUpdated
    ? new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(lastUpdated))
    : null;
  const navItems = [
    { id: "overview", label: t("Overview", "Tong quan") },
    { id: "curriculum", label: t("Curriculum", "Chuong trinh") },
    { id: "requirements", label: t("Requirements", "Yeu cau") },
    { id: "about", label: t("About", "Gioi thieu") },
    { id: "reviews", label: t("Reviews", "Danh gia") },
  ];
  if (relatedCourses.length > 0) {
    navItems.push({ id: "related", label: t("Related", "Lien quan") });
  }

  return (
    <div className="section-shell py-12 fade-in">
      <CourseViewTracker courseId={course.id} />
      <div className="mb-10 space-y-4">
        <Link href="/courses" className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {t("Courses", "Khoa hoc")}
        </Link>
        <h1 className="section-title text-4xl font-semibold text-emerald-950 md:text-5xl">{course.title}</h1>
        <p className="text-lg text-emerald-800/70">{course.shortDescription}</p>
        {metaBadges.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {metaBadges.map((item) => (
              <span key={item} className="badge">
                {item}
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-3 text-sm text-emerald-800/70">
          <div className="stat-pill">
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-emerald-700">
              {t("Rating", "Danh gia")}
            </span>
            <span className="text-sm font-semibold text-emerald-950">
              {averageRating.toFixed(1)} ({reviewCount})
            </span>
          </div>
          <div className="stat-pill">
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-emerald-700">
              {t("Students", "Hoc vien")}
            </span>
            <span className="text-sm font-semibold text-emerald-950">
              {studentCount} {t("enrolled", "dang hoc")}
            </span>
          </div>
          <div className="stat-pill">
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-emerald-700">
              {t("Duration", "Thoi luong")}
            </span>
            <span className="text-sm font-semibold text-emerald-950">{totalDurationLabel}</span>
          </div>
        </div>
        <nav className="flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {navItems.map((item) => (
            <a key={item.id} href={`#${item.id}`} className="underline-hover">
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="grid gap-10 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-8">
          <section id="overview" className="surface-card p-6">
            <div className="grid gap-6 lg:grid-cols-[1.25fr,0.75fr]">
              <div>
                <h2 className="section-title text-2xl font-semibold text-emerald-950">
                  {t("What you will learn", "Ban se hoc duoc")}
                </h2>
                <p className="mt-3 text-sm text-emerald-800/70">
                  {course.outcome || t("Build practical skills.", "Xay dung ky nang thuc hanh.")}
                </p>
                {outcomeItems.length > 0 && (
                  <ul className="mt-4 grid gap-3 md:grid-cols-2">
                    {outcomeItems.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-emerald-900">
                        <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600/80" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="surface-muted p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  {t("Course at a glance", "Tong quan khoa hoc")}
                </h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-emerald-800/70">{t("Chapters", "Chuong")}</dt>
                    <dd className="font-semibold text-emerald-950">{chapters.length}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-emerald-800/70">{t("Lessons", "Bai hoc")}</dt>
                    <dd className="font-semibold text-emerald-950">{course.lessons.length}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-emerald-800/70">{t("Level", "Trinh do")}</dt>
                    <dd className="font-semibold text-emerald-950">{levelLabel}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-emerald-800/70">{t("Language", "Ngon ngu")}</dt>
                    <dd className="font-semibold text-emerald-950">{languageLabel}</dd>
                  </div>
                  {lastUpdatedLabel && (
                    <div className="flex items-center justify-between">
                      <dt className="text-emerald-800/70">{t("Last updated", "Cap nhat")}</dt>
                      <dd className="font-semibold text-emerald-950">{lastUpdatedLabel}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </section>

          <section id="curriculum" className="surface-card p-6">
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
                  className="group surface-muted p-4"
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

          <section id="requirements" className="surface-card p-6">
            <h2 className="section-title text-2xl font-semibold text-emerald-950">
              {t("Requirements", "Yeu cau")}
            </h2>
            {requirementItems.length > 0 ? (
              <ul className="mt-4 space-y-3 text-sm text-emerald-900">
                {requirementItems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600/80" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-emerald-800/70">
                {course.requirements || t("No prerequisites.", "Khong yeu cau kien thuc truoc.")}
              </p>
            )}
          </section>

          <section id="about" className="surface-card p-6">
            <h2 className="section-title text-2xl font-semibold text-emerald-950">
              {t("About this course", "Gioi thieu khoa hoc")}
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm text-emerald-800/70">{course.description}</p>
          </section>

          {relatedCourses.length > 0 && (
            <section id="related" className="surface-card p-6">
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

          <section id="reviews">
            <CourseReviews courseId={course.id} courseSlug={course.slug} />
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="surface-card p-6 shadow-sm">
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
              className="mt-3 inline-flex w-full justify-center rounded-full border border-[color:var(--stroke)] px-4 py-2 text-xs font-semibold text-emerald-900"
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

          <div className="surface-card p-6">
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
              className="mt-4 inline-flex rounded-full border border-[color:var(--stroke)] px-4 py-2 text-xs font-semibold text-emerald-900"
            >
              {t("Book a consult", "Dat lich tu van")}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}


