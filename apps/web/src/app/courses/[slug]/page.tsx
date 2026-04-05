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
  const curriculumSummary = `${chapters.length} ${t("chapters", "chuong")} · ${course.lessons.length} ${t(
    "lessons",
    "bai hoc"
  )} · ${totalDurationLabel}`;
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
  const outcomeItems = splitIntoItems(course.outcome || "");
  const requirementItems = splitIntoItems(course.requirements || "");

  return (
    <div className="min-h-screen bg-gray-50">
      <CourseViewTracker courseId={course.id} />

      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {course.category?.title && (
                <div className="inline-block bg-blue-600 px-3 py-1 rounded-full text-sm mb-4">
                  {course.category.title}
                </div>
              )}
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-gray-300 mb-6">{course.shortDescription}</p>

              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">?</span>
                  <span className="font-semibold">{averageRating.toFixed(1)}</span>
                  <span className="text-gray-400">({reviewCount} {t("reviews", "danh gia")})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{totalDurationLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{levelLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{course.lessons.length} {t("lessons", "bai hoc")}</span>
                </div>
              </div>

              <p className="text-gray-300">
                {t("Language", "Ngon ngu")}: <span className="text-white font-semibold">{languageLabel}</span>
              </p>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg overflow-hidden shadow-xl sticky top-20">
                <img
                  src={imageUrl}
                  alt={course.title}
                  className="w-full aspect-video object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    {originalPrice && (
                      <span className="text-gray-400 line-through">{new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(originalPrice)}</span>
                    )}
                    <span className="text-3xl font-bold text-blue-600">{formattedPrice}</span>
                    {isFlashSale && originalPrice && (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-semibold">
                        {t("Save", "Giam")} {Math.round(((originalPrice - (course.effectivePrice ?? course.price)) / originalPrice) * 100)}%
                      </span>
                    )}
                  </div>

                  <CourseActions courseId={course.id} courseSlug={course.slug} />

                  <Link
                    href={`/learn/${course.slug}`}
                    className="block w-full py-3 rounded-lg font-semibold text-center bg-blue-600 text-white hover:bg-blue-700 transition-colors mt-3"
                  >
                    {t("Start learning", "Bat dau hoc")}
                  </Link>

                  <div className="mt-6 space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span>{t("Certificate", "Chung chi")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{t("Lifetime access", "Truy cap tron doi")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{t("Resources", "Tai nguyen")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("What you will learn", "Ban se hoc duoc")}</h2>
                {outcomeItems.length > 0 ? (
                  <ul className="grid md:grid-cols-2 gap-3">
                    {outcomeItems.map((outcome) => (
                      <li key={outcome} className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <span className="text-gray-700">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-700">{course.outcome || t("Build practical skills.", "Xay dung ky nang thuc hanh.")}</p>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{t("Curriculum", "Chuong trinh")}</h2>
                  <div className="text-sm text-gray-600">{curriculumSummary}</div>
                </div>

                <div className="space-y-3">
                  {chapters.map((chapter, index) => (
                    <details key={chapter.key} className="border border-gray-200 rounded-lg overflow-hidden" open={index < 2}>
                      <summary className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="text-left">
                          <div className="font-semibold text-gray-900">{chapter.title}</div>
                          <div className="text-sm text-gray-600">
                            {chapter.lessons.length} {t("lessons", "bai hoc")} · {formatDuration(chapter.totalMinutes, t)}
                          </div>
                        </div>
                      </summary>
                      <div className="px-4 pb-4 bg-gray-50">
                        <div className="space-y-2 pt-2">
                          {chapter.lessons.map((lesson) => (
                            <div key={lesson.id} className="flex items-center justify-between text-sm text-gray-600 py-2">
                              <span>{lesson.title}</span>
                              <span>{lesson.durationMinutes} {t("mins", "phut")}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("Requirements", "Yeu cau")}</h2>
                {requirementItems.length > 0 ? (
                  <ul className="space-y-2 text-gray-700">
                    {requirementItems.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-700">{course.requirements || t("No prerequisites.", "Khong yeu cau kien thuc truoc.")}</p>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("About this course", "Mo ta")}</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{course.description}</p>
              </div>

              <section id="reviews">
                <CourseReviews courseId={course.id} courseSlug={course.slug} />
              </section>

              {relatedCourses.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("Related courses", "Khoa hoc lien quan")}</h2>
                  <div className="grid gap-5 md:grid-cols-2">
                    {relatedCourses.map((item) => (
                      <CourseCard key={item.id} course={item} locale={locale} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1"></div>
          </div>
        </div>
      </section>
    </div>
  );
}
