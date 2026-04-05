import Link from "next/link";
import { API_URL } from "@/lib/api";
import { CourseCard, CourseSummary } from "@/components/CourseCard";
import { getServerLocale } from "@/lib/server-locale";
import { pickLocaleText } from "@/lib/i18n";
import { SearchSuggestInput } from "@/components/SearchSuggestInput";

interface Category {
  id: number;
  title: string;
  slug: string;
}

async function getCourses(): Promise<CourseSummary[]> {
  try {
    const res = await fetch(`${API_URL}/api/courses`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/api/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const locale = await getServerLocale();
  const t = (en: string, vi: string) => pickLocaleText(locale, en, vi);

  const [courses, categories] = await Promise.all([getCourses(), getCategories()]);
  const topCourses = courses.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t("Learn UX/UI from top experts", "Kham pha khoa hoc UX/UI hang dau")}
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              {t(
                "Upgrade your skills with practical, mentor-led courses.",
                "Nang cao ky nang voi khoa hoc thuc chien va mentor huong dan."
              )}
            </p>

            <div className="relative max-w-2xl mx-auto">
              <form
                action="/courses"
                method="get"
                className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-lg"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-gray-400" fill="none" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                </svg>
                <SearchSuggestInput
                  name="q"
                  placeholder={t("Search courses, instructors...", "Tim khoa hoc, giang vien...")}
                  inputClassName="w-full bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none"
                  className="flex-1"
                />
                <button
                  type="submit"
                  className="hidden sm:inline-flex bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  {t("Search", "Tim kiem")}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{courses.length}+</div>
              <div className="text-gray-600">{t("Courses", "Khoa hoc")}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
              <div className="text-gray-600">{t("Learners", "Hoc vien")}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
              <div className="text-gray-600">{t("Instructors", "Giang vien")}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">4.8?</div>
              <div className="text-gray-600">{t("Avg rating", "Danh gia TB")}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16" strokeLinecap="round" />
                <path d="M6 12h12" strokeLinecap="round" />
                <path d="M8 18h8" strokeLinecap="round" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900">{t("Categories", "Danh muc")}</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {categories.length === 0 ? (
                <span className="text-sm text-gray-500">{t("No categories yet.", "Chua co danh muc.")}</span>
              ) : (
                categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/courses?category=${category.slug}`}
                    className="px-4 py-2 rounded-full bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 text-sm font-medium"
                  >
                    {category.title}
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-600">
              {t("Found", "Tim thay")} <span className="font-semibold text-gray-900">{topCourses.length}</span> {t("courses", "khoa hoc")}
            </p>
          </div>

          {topCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topCourses.map((course) => (
                <CourseCard key={course.id} course={course} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">{t("No courses found.", "Chua co khoa hoc.")}</p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("Start your learning journey today", "Bat dau hanh trinh hoc tap ngay hom nay")}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {t(
              "Join thousands of learners upgrading their careers.",
              "Tham gia cong dong hoc vien dang nang cap su nghiep."
            )}
          </p>
          <Link
            href="/courses"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            {t("Explore courses", "Kham pha ngay")}
          </Link>
        </div>
      </section>
    </div>
  );
}
