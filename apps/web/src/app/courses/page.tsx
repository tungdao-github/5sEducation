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

type CourseFilters = {
  search?: string;
  category?: string;
  level?: string;
  language?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
  sort?: string;
  page?: string;
  pageSize?: string;
};

type CourseResponse = {
  items: CourseSummary[];
  total: number;
};

async function getCourses(filters: CourseFilters): Promise<CourseResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.level) params.set("level", filters.level);
  if (filters.language) params.set("language", filters.language);
  if (filters.minPrice) params.set("minPrice", filters.minPrice);
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
  if (filters.minRating) params.set("minRating", filters.minRating);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.page) params.set("page", filters.page);
  if (filters.pageSize) params.set("pageSize", filters.pageSize);

  const url = params.toString() ? `${API_URL}/api/courses?${params}` : `${API_URL}/api/courses`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return { items: [], total: 0 };
    const items = (await res.json()) as CourseSummary[];
    const totalHeader = res.headers.get("X-Total-Count");
    const parsedTotal = totalHeader ? Number.parseInt(totalHeader, 10) : 0;
    const total = Number.isNaN(parsedTotal) || parsedTotal <= 0 ? items.length : parsedTotal;
    return { items, total };
  } catch {
    return { items: [], total: 0 };
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

export default async function CoursesPage({
  searchParams,
}: {
  searchParams:
    | {
        q?: string;
        category?: string;
        level?: string;
        language?: string;
        minPrice?: string;
        maxPrice?: string;
        minRating?: string;
        sort?: string;
        page?: string;
        pageSize?: string;
      }
    | Promise<{
        q?: string;
        category?: string;
        level?: string;
        language?: string;
        minPrice?: string;
        maxPrice?: string;
        minRating?: string;
        sort?: string;
        page?: string;
        pageSize?: string;
      }>;
}) {
  const locale = await getServerLocale();
  const t = (en: string, vi: string) => pickLocaleText(locale, en, vi);

  const resolvedParams = await Promise.resolve(searchParams);
  const search = resolvedParams.q ?? "";
  const category = resolvedParams.category ?? "";
  const level = resolvedParams.level ?? "";
  const language = resolvedParams.language ?? "";
  const minPrice = resolvedParams.minPrice ?? "";
  const maxPrice = resolvedParams.maxPrice ?? "";
  const minRating = resolvedParams.minRating ?? "";
  const sort = resolvedParams.sort ?? "";
  const page = Number.parseInt(resolvedParams.page ?? "1", 10);
  const pageSize = Number.parseInt(resolvedParams.pageSize ?? "12", 10);
  const resolvedPage = Number.isNaN(page) || page < 1 ? 1 : page;
  const resolvedPageSize = Number.isNaN(pageSize) || pageSize < 1 ? 12 : Math.min(pageSize, 60);

  const [courseResponse, categories] = await Promise.all([
    getCourses({
      search,
      category,
      level,
      language,
      minPrice,
      maxPrice,
      minRating,
      sort,
      page: resolvedPage.toString(),
      pageSize: resolvedPageSize.toString(),
    }),
    getCategories(),
  ]);

  const courses = courseResponse.items;
  const totalCourses = courseResponse.total;
  const totalPages = Math.max(1, Math.ceil(totalCourses / resolvedPageSize));
  const currentPage = Math.min(resolvedPage, totalPages);
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;
  const startIndex = totalCourses === 0 ? 0 : (currentPage - 1) * resolvedPageSize + 1;
  const endIndex = totalCourses === 0 ? 0 : Math.min(currentPage * resolvedPageSize, totalCourses);
  const categoryLabel = category
    ? categories.find((item) => item.slug === category)?.title ?? category
    : "";
  const levelLabel =
    level === "Beginner"
      ? t("Beginner", "Co ban")
      : level === "Intermediate"
        ? t("Intermediate", "Trung cap")
        : level === "Advanced"
          ? t("Advanced", "Nang cao")
          : level;
  const languageLabel =
    language === "English" ? t("English", "Tieng Anh") : language === "Vietnamese" ? t("Vietnamese", "Tieng Viet") : language;
  const sortLabelMap: Record<string, string> = {
    popular: t("Most popular", "Pho bien"),
    rating: t("Top rated", "Danh gia cao"),
    price_asc: t("Price low to high", "Gia tang dan"),
    price_desc: t("Price high to low", "Gia giam dan"),
  };
  const sortLabel = sort ? sortLabelMap[sort] ?? sort : "";
  const activeFilters = [
    search ? `${t("Search", "Tim kiem")}: ${search}` : null,
    categoryLabel ? `${t("Category", "Danh muc")}: ${categoryLabel}` : null,
    levelLabel ? `${t("Level", "Cap do")}: ${levelLabel}` : null,
    languageLabel ? `${t("Language", "Ngon ngu")}: ${languageLabel}` : null,
    minPrice ? `${t("Min price", "Gia tu")}: $${minPrice}` : null,
    maxPrice ? `${t("Max price", "Gia den")}: $${maxPrice}` : null,
    minRating ? `${t("Rating", "Danh gia")}: ${minRating}+` : null,
    sortLabel ? `${t("Sort", "Sap xep")}: ${sortLabel}` : null,
  ].filter(Boolean) as string[];

  const baseParams = new URLSearchParams();
  if (search) baseParams.set("q", search);
  if (level) baseParams.set("level", level);
  if (language) baseParams.set("language", language);
  if (minPrice) baseParams.set("minPrice", minPrice);
  if (maxPrice) baseParams.set("maxPrice", maxPrice);
  if (minRating) baseParams.set("minRating", minRating);
  if (sort) baseParams.set("sort", sort);
  baseParams.set("pageSize", resolvedPageSize.toString());

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <form
            action="/courses"
            method="get"
            className="flex gap-3"
          >
            <div className="flex-1 relative flex bg-white border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              <svg viewBox="0 0 24 24" className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
              </svg>
              <SearchSuggestInput
                name="q"
                defaultValue={search}
                placeholder={t("Search courses", "Tim khoa hoc")}
                inputClassName="flex-1 pl-11 pr-4 py-3 focus:outline-none text-gray-900 bg-transparent"
              />
            </div>
            <button
              type="submit"
              className="hidden sm:inline-flex items-center gap-2 px-4 rounded-xl border bg-blue-600 text-white border-blue-600 text-sm font-medium hover:bg-blue-700"
            >
              {t("Search", "Tim")}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <form action="/courses" method="get" className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24 space-y-5">
              {search && <input type="hidden" name="q" value={search} />}
              <input type="hidden" name="pageSize" value={resolvedPageSize.toString()} />

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">{t("Category", "Danh muc")}</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="category" value="" defaultChecked={!category} className="text-blue-600" />
                    <span className="text-sm text-gray-600">{t("All", "Tat ca")}</span>
                  </label>
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={cat.slug}
                        defaultChecked={category === cat.slug}
                        className="text-blue-600"
                      />
                      <span className="text-sm text-gray-600">{cat.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">{t("Level", "Trinh do")}</h4>
                <select
                  name="level"
                  defaultValue={level}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">{t("All levels", "Tat ca cap do")}</option>
                  <option value="Beginner">{t("Beginner", "Co ban")}</option>
                  <option value="Intermediate">{t("Intermediate", "Trung cap")}</option>
                  <option value="Advanced">{t("Advanced", "Nang cao")}</option>
                </select>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">{t("Language", "Ngon ngu")}</h4>
                <select
                  name="language"
                  defaultValue={language}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">{t("All languages", "Tat ca")}</option>
                  <option value="English">{t("English", "Tieng Anh")}</option>
                  <option value="Vietnamese">{t("Vietnamese", "Tieng Viet")}</option>
                </select>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">{t("Price", "Gia")}</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    name="minPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={minPrice}
                    placeholder={t("Min", "Tu")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                  <input
                    name="maxPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={maxPrice}
                    placeholder={t("Max", "Den")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">{t("Min rating", "Danh gia")}</h4>
                <select
                  name="minRating"
                  defaultValue={minRating}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">{t("Any rating", "Tat ca")}</option>
                  <option value="3">3+</option>
                  <option value="3.5">3.5+</option>
                  <option value="4">4+</option>
                  <option value="4.5">4.5+</option>
                </select>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">{t("Sort", "Sap xep")}</h4>
                <select
                  name="sort"
                  defaultValue={sort}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">{t("Newest", "Moi nhat")}</option>
                  <option value="popular">{t("Most popular", "Pho bien")}</option>
                  <option value="rating">{t("Top rated", "Danh gia cao")}</option>
                  <option value="price_asc">{t("Price low to high", "Gia tang dan")}</option>
                  <option value="price_desc">{t("Price high to low", "Gia giam dan")}</option>
                </select>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">{t("Page size", "So khoa hoc")}</h4>
                <select
                  name="pageSize"
                  defaultValue={resolvedPageSize.toString()}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="12">12</option>
                  <option value="24">24</option>
                  <option value="36">36</option>
                  <option value="48">48</option>
                  <option value="60">60</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                {t("Apply filters", "Ap dung")}
              </button>

              {(search || category || level || language || minPrice || maxPrice || minRating || sort) && (
                <Link
                  href="/courses"
                  className="block text-center text-sm text-blue-600 hover:underline"
                >
                  {t("Reset filters", "Xoa bo loc")}
                </Link>
              )}
            </form>
          </aside>

          <div className="flex-1 min-w-0 space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-gray-600 text-sm">
                {search && <span className="font-medium">"{search}" · </span>}
                {t("Found", "Tim thay")} <span className="font-semibold text-gray-900">{totalCourses}</span> {t("courses", "khoa hoc")}
              </p>
              <div className="text-xs text-gray-500">
                {t("Showing", "Hien thi")} {startIndex}-{endIndex}
              </div>
            </div>

            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((item) => (
                  <span key={item} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                    {item}
                  </span>
                ))}
              </div>
            )}

            {courses.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500">{t("No courses found.", "Khong tim thay khoa hoc.")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} locale={locale} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
                <span>
                  {t("Page", "Trang")} {currentPage} / {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  {prevPage ? (
                    <Link
                      href={`/courses?${(() => {
                        const params = new URLSearchParams(baseParams);
                        params.set("page", prevPage.toString());
                        return params.toString();
                      })()}`}
                      className="rounded-lg border border-gray-200 px-4 py-1 text-xs font-semibold text-gray-700"
                    >
                      {t("Previous", "Truoc")}
                    </Link>
                  ) : (
                    <span className="rounded-lg border border-gray-200 px-4 py-1 text-xs font-semibold text-gray-300">
                      {t("Previous", "Truoc")}
                    </span>
                  )}
                  {nextPage ? (
                    <Link
                      href={`/courses?${(() => {
                        const params = new URLSearchParams(baseParams);
                        params.set("page", nextPage.toString());
                        return params.toString();
                      })()}`}
                      className="rounded-lg border border-gray-200 px-4 py-1 text-xs font-semibold text-gray-700"
                    >
                      {t("Next", "Tiep")}
                    </Link>
                  ) : (
                    <span className="rounded-lg border border-gray-200 px-4 py-1 text-xs font-semibold text-gray-300">
                      {t("Next", "Tiep")}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
