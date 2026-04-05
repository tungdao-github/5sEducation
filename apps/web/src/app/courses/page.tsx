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
    <div className="section-shell space-y-10 py-12 fade-in">
      <div className="space-y-3">
        <Link href="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {t("Home", "Trang chu")}
        </Link>
        <h1 className="section-title text-4xl font-semibold text-emerald-950">
          {t("All courses", "Tat ca khoa hoc")}
        </h1>
        <p className="text-sm text-emerald-800/70">
          {t(
            "Find a path that matches your goals, experience, and schedule.",
            "Tim lo trinh phu hop voi muc tieu, kinh nghiem va thoi gian cua ban."
          )}
        </p>
        <div className="flex flex-wrap gap-3 text-sm text-emerald-800/70">
          <div className="stat-pill">
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-emerald-700">
              {t("Results", "Ket qua")}
            </span>
            <span className="text-sm font-semibold text-emerald-950">{totalCourses}</span>
          </div>
          <div className="stat-pill">
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-emerald-700">
              {t("Showing", "Hien thi")}
            </span>
            <span className="text-sm font-semibold text-emerald-950">
              {startIndex}-{endIndex}
            </span>
          </div>
        </div>
      </div>

      <div className="surface-card space-y-6 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {t("Filters", "Bo loc")}
            </p>
            <h2 className="section-title text-2xl font-semibold text-emerald-950">
              {t("Find the right course", "Tim khoa hoc phu hop")}
            </h2>
            <p className="text-sm text-emerald-800/70">
              {t("Narrow by price, level, and topic to move faster.", "Loc theo gia, cap do, va chu de de tim nhanh hon.")}
            </p>
          </div>
          <div className="stat-pill">
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-emerald-700">
              {t("Page size", "So khoa hoc")}
            </span>
            <span className="text-sm font-semibold text-emerald-950">{resolvedPageSize}</span>
          </div>
        </div>
        <form action="/courses" method="get" className="flex flex-col gap-3">
          {category && <input type="hidden" name="category" value={category} />}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {t("Search", "Tim kiem")}
            </label>
            <SearchSuggestInput
              name="q"
              defaultValue={search}
              placeholder={t("Search courses", "Tim khoa hoc")}
              className="flex-1"
              inputClassName="flex-1 rounded-full border border-[color:var(--stroke)] bg-white px-4 py-2 text-sm text-emerald-950 focus:outline-none"
              enableVoice
            />
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              <span>{t("Min price", "Gia tu")}</span>
              <input
                name="minPrice"
                type="number"
                step="0.01"
                min="0"
                defaultValue={minPrice}
                placeholder={t("Min price", "Gia tu")}
                className="w-full rounded-full border border-[color:var(--stroke)] bg-white px-4 py-2 text-sm font-normal normal-case text-emerald-900"
              />
            </label>
            <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              <span>{t("Max price", "Gia den")}</span>
              <input
                name="maxPrice"
                type="number"
                step="0.01"
                min="0"
                defaultValue={maxPrice}
                placeholder={t("Max price", "Gia den")}
                className="w-full rounded-full border border-[color:var(--stroke)] bg-white px-4 py-2 text-sm font-normal normal-case text-emerald-900"
              />
            </label>
            <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              <span>{t("Level", "Cap do")}</span>
              <select
                name="level"
                defaultValue={level}
                className="w-full rounded-full border border-[color:var(--stroke)] bg-white px-4 py-2 text-sm font-normal normal-case text-emerald-900"
              >
                <option value="">{t("All levels", "Tat ca cap do")}</option>
                <option value="Beginner">{t("Beginner", "Co ban")}</option>
                <option value="Intermediate">{t("Intermediate", "Trung cap")}</option>
                <option value="Advanced">{t("Advanced", "Nang cao")}</option>
              </select>
            </label>
            <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              <span>{t("Language", "Ngon ngu")}</span>
              <select
                name="language"
                defaultValue={language}
                className="w-full rounded-full border border-[color:var(--stroke)] bg-white px-4 py-2 text-sm font-normal normal-case text-emerald-900"
              >
                <option value="">{t("All languages", "Tat ca ngon ngu")}</option>
                <option value="English">{t("English", "Tieng Anh")}</option>
                <option value="Vietnamese">{t("Vietnamese", "Tieng Viet")}</option>
              </select>
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              <span>{t("Rating", "Danh gia")}</span>
              <select
                name="minRating"
                defaultValue={minRating}
                className="w-full rounded-full border border-[color:var(--stroke)] bg-white px-4 py-2 text-sm font-normal normal-case text-emerald-900"
              >
                <option value="">{t("Any rating", "Moi danh gia")}</option>
                <option value="3">3+</option>
                <option value="3.5">3.5+</option>
                <option value="4">4+</option>
                <option value="4.5">4.5+</option>
              </select>
            </label>
            <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              <span>{t("Sort", "Sap xep")}</span>
              <select
                name="sort"
                defaultValue={sort}
                className="w-full rounded-full border border-[color:var(--stroke)] bg-white px-4 py-2 text-sm font-normal normal-case text-emerald-900"
              >
                <option value="">{t("Newest", "Moi nhat")}</option>
                <option value="popular">{t("Most popular", "Pho bien")}</option>
                <option value="rating">{t("Top rated", "Danh gia cao")}</option>
                <option value="price_asc">{t("Price low to high", "Gia tang dan")}</option>
                <option value="price_desc">{t("Price high to low", "Gia giam dan")}</option>
              </select>
            </label>
            <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              <span>{t("Page size", "So khoa hoc")}</span>
              <select
                name="pageSize"
                defaultValue={resolvedPageSize.toString()}
                className="w-full rounded-full border border-[color:var(--stroke)] bg-white px-4 py-2 text-sm font-normal normal-case text-emerald-900"
              >
                <option value="12">12 / {t("page", "trang")}</option>
                <option value="24">24 / {t("page", "trang")}</option>
                <option value="36">36 / {t("page", "trang")}</option>
                <option value="48">48 / {t("page", "trang")}</option>
                <option value="60">60 / {t("page", "trang")}</option>
              </select>
            </label>
            <button
              type="submit"
              className="rounded-full bg-emerald-700 px-6 py-2 text-sm font-semibold text-white"
            >
              {t("Apply filters", "Ap dung bo loc")}
            </button>
          </div>
        </form>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            {t("Categories", "Danh muc")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/courses${baseParams.toString() ? `?${baseParams}` : ""}`}
              className={`rounded-full border px-4 py-1 text-xs font-semibold ${
                category ? "border-[color:var(--stroke)] text-emerald-800" : "border-[color:var(--brand)] bg-emerald-700 text-white"
              }`}
            >
              {t("All", "Tat ca")}
            </Link>
            {categories.map((item) => (
              <Link
                key={item.id}
                href={`/courses?${(() => {
                  const params = new URLSearchParams(baseParams);
                  params.set("category", item.slug);
                  return params.toString();
                })()}`}
                className={`rounded-full border px-4 py-1 text-xs font-semibold ${
                  category === item.slug
                    ? "border-[color:var(--brand)] bg-emerald-700 text-white"
                    : "border-[color:var(--stroke)] text-emerald-800"
                }`}
              >
                {item.title}
              </Link>
            ))}
            {(search || category || level || language || minPrice || maxPrice || minRating || sort) && (
              <Link
                href="/courses"
                className="rounded-full border border-[color:var(--stroke)] px-4 py-1 text-xs font-semibold text-emerald-900"
              >
                {t("Reset filters", "Xoa bo loc")}
              </Link>
            )}
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {t("Active filters", "Bo loc dang dung")}
            </p>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((item) => (
                <span key={item} className="badge">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="surface-card p-10 text-center text-sm text-emerald-800/70">
          {t("No courses found. Try changing your filters.", "Khong tim thay khoa hoc. Hay thu doi bo loc.")}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 stagger">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} locale={locale} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-emerald-800/70">
              <span>
                {t("Page", "Trang")} {currentPage} / {totalPages} - {t("Showing", "Hien thi")} {startIndex}-{endIndex}{" "}
                {t("of", "tren")} {totalCourses} {t("courses", "khoa hoc")}
              </span>
              <div className="flex items-center gap-2">
                {prevPage ? (
                  <Link
                    href={`/courses?${(() => {
                      const params = new URLSearchParams(baseParams);
                      params.set("page", prevPage.toString());
                      return params.toString();
                    })()}`}
                    className="rounded-full border border-[color:var(--stroke)] px-4 py-1 text-xs font-semibold text-emerald-900"
                  >
                    {t("Previous", "Truoc")}
                  </Link>
                ) : (
                  <span className="rounded-full border border-[color:var(--stroke)] px-4 py-1 text-xs font-semibold text-emerald-400">
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
                    className="rounded-full border border-[color:var(--stroke)] px-4 py-1 text-xs font-semibold text-emerald-900"
                  >
                    {t("Next", "Tiep")}
                  </Link>
                ) : (
                  <span className="rounded-full border border-[color:var(--stroke)] px-4 py-1 text-xs font-semibold text-emerald-400">
                    {t("Next", "Tiep")}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


