import Link from "next/link";
import { API_URL } from "@/lib/api";
import { CourseCard, CourseSummary } from "@/components/CourseCard";
import { getServerLocale } from "@/lib/server-locale";
import { pickLocaleText } from "@/lib/i18n";
import { LearningPathCard, LearningPathSummary } from "@/components/LearningPathCard";
import { HomeBlocks, HomePageBlock } from "@/components/HomeBlocks";
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

async function getLearningPaths(): Promise<LearningPathSummary[]> {
  try {
    const res = await fetch(`${API_URL}/api/learning-paths`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getHomeBlocks(locale: string): Promise<HomePageBlock[]> {
  try {
    const res = await fetch(`${API_URL}/api/homepage/blocks?locale=${locale}`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const locale = await getServerLocale();
  const t = (en: string, vi: string) => pickLocaleText(locale, en, vi);

  const [courses, categories, learningPaths, blocks] = await Promise.all([
    getCourses(),
    getCategories(),
    getLearningPaths(),
    getHomeBlocks(locale),
  ]);

  const topCourses = courses.slice(0, 6);
  const featuredCategories = categories.slice(0, 6);
  const featuredPaths = learningPaths.slice(0, 4);
  const hasHeroBlock = blocks.some((block) => block.type === "hero");
  const hasCtaBlock = blocks.some((block) => block.type === "cta");
  const hasFeatureBlock = blocks.some((block) => block.type === "feature");
  const valueProps = [
    {
      title: t("Mentor-led studio sprints", "Sprint thuc chien co mentor"),
      description: t(
        "Weekly feedback cycles with senior mentors so you ship real portfolio work.",
        "Review hang tuan voi mentor senior de ban hoan thanh case study that."
      ),
    },
    {
      title: t("Job-ready skill tracks", "Lo trinh ky nang san sang di lam"),
      description: t(
        "Structured paths for product, data, and engineering roles with clear milestones.",
        "Lo trinh co cau truc cho product, data, va engineering voi moc tien do ro rang."
      ),
    },
    {
      title: t("Cohort learning community", "Cong dong hoc theo cohort"),
      description: t(
        "Small cohorts keep you accountable, supported, and moving fast with peers.",
        "Cohort nho giup ban co dong luc va tien nhanh cung dong doi."
      ),
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {blocks.length > 0 && <HomeBlocks blocks={blocks} locale={locale} />}
      {!hasHeroBlock && (
        <section className="hero-grid fade-in">
          <div className="section-shell grid gap-10 py-16 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="space-y-6">
              <span className="badge">{t("New season", "Mua hoc moi")}</span>
              <h1 className="section-title text-4xl font-semibold text-emerald-950 md:text-5xl">
                {t("Build skills that turn into real work.", "Xay dung ky nang de lam viec thuc te.")}
              </h1>
              <p className="text-lg text-emerald-800/70">
                {t(
                  "5S Education blends structured learning paths, live feedback, and projects that mirror real client work.",
                  "5S Education ket hop lo trinh hoc co cau truc, phan hoi truc tiep, va du an mo phong cong viec thuc te."
                )}
              </p>
              <form
                action="/courses"
                method="get"
                className="flex flex-col gap-3 rounded-3xl bg-white/80 p-4 shadow-sm ring-1 ring-[color:var(--stroke)] sm:flex-row"
              >
                <SearchSuggestInput
                  name="q"
                  placeholder={t("Search courses, tools, or roles", "Tim khoa hoc, cong cu, hoac vai tro")}
                  className="flex-1"
                  inputClassName="w-full bg-transparent text-sm text-emerald-950 placeholder:text-emerald-700/60 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-emerald-700 px-6 py-2 text-sm font-semibold text-white"
                >
                  {t("Explore", "Kham pha")}
                </button>
              </form>
              <div className="flex flex-wrap gap-4 text-sm text-emerald-800/70">
                <div className="stat-pill">
                  <p className="text-lg font-semibold text-emerald-950">{courses.length}</p>
                  <p>{t("Curated courses", "Khoa hoc chon loc")}</p>
                </div>
                <div className="stat-pill">
                  <p className="text-lg font-semibold text-emerald-950">120+</p>
                  <p>{t("Mentor hours", "Gio mentor")}</p>
                </div>
                <div className="stat-pill">
                  <p className="text-lg font-semibold text-emerald-950">95%</p>
                  <p>{t("Completion rate", "Ty le hoan thanh")}</p>
                </div>
              </div>
            </div>

            <div className="surface-card flex flex-col gap-6 p-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  {t("Featured", "Noi bat")}
                </p>
                <h2 className="text-2xl font-semibold text-emerald-950">
                  {t("Weekly studio brief", "Ban tin studio hang tuan")}
                </h2>
                <p className="text-sm text-emerald-800/70">
                  {t(
                    "Join a short sprint guided by real product teams. Ship a portfolio-ready case study in 7 days.",
                    "Tham gia sprint ngan duoc huong dan boi doi ngu san pham thuc te. Hoan thanh case study trong 7 ngay."
                  )}
                </p>
              </div>
              <div className="surface-muted p-4">
                <p className="text-sm font-semibold text-emerald-900">
                  {t("Next cohort starts", "Khai giang dot tiep theo")}
                </p>
                <p className="text-3xl font-semibold text-emerald-950">Apr 12</p>
                <p className="text-xs text-emerald-800/70">
                  {t("Limited seats - Live review", "Cho ngoi gioi han - Review truc tiep")}
                </p>
              </div>
              <Link
                href="/courses"
                className="rounded-full bg-emerald-700 px-5 py-3 text-center text-sm font-semibold text-white"
              >
                {t("View the curriculum", "Xem lo trinh hoc")}
              </Link>
            </div>
          </div>
        </section>
      )}

      {!hasFeatureBlock && (
        <section className="section-shell space-y-6">
          <div>
            <span className="section-eyebrow">{t("Why 5S", "Vi sao 5S")}</span>
            <h2 className="section-title mt-3 text-3xl font-semibold text-emerald-950">
              {t("A learning studio built for outcomes", "Studio hoc tap tap trung vao ket qua")}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {valueProps.map((item) => (
              <div key={item.title} className="surface-card space-y-3 p-6">
                <h3 className="text-lg font-semibold text-emerald-950">{item.title}</h3>
                <p className="text-sm text-emerald-800/70">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section-shell space-y-6">
        <div>
          <h2 className="section-title text-3xl font-semibold text-emerald-950">
            {t("Popular categories", "Danh muc pho bien")}
          </h2>
          <p className="text-sm text-emerald-800/70">
            {t("Explore structured learning paths.", "Kham pha cac lo trinh hoc co cau truc.")}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger">
          {featuredCategories.length === 0 && (
            <div className="surface-card p-6 text-sm text-emerald-800/70">
              {t(
                "Categories will appear once you add them in the admin panel.",
                "Danh muc se hien thi sau khi ban them trong trang admin."
              )}
            </div>
          )}
          {featuredCategories.map((category) => (
            <Link
              key={category.id}
              href={`/courses?category=${category.slug}`}
              className="surface-card p-6 transition hover:-translate-y-1"
            >
              <p className="text-sm font-semibold text-emerald-950">{category.title}</p>
              <p className="text-xs text-emerald-800/70">
                {t("Curated path - Updated weekly", "Lo trinh chon loc - Cap nhat hang tuan")}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-shell space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="section-title text-3xl font-semibold text-emerald-950">
              {t("Top courses", "Khoa hoc hang dau")}
            </h2>
            <p className="text-sm text-emerald-800/70">
              {t(
                "Hand-picked learning paths with mentor support.",
                "Lo trinh hoc duoc chon loc kem mentor ho tro."
              )}
            </p>
          </div>
          <Link href="/courses" className="text-sm font-semibold text-emerald-800 underline-hover">
            {t("Browse all", "Xem tat ca")}
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 stagger">
          {topCourses.map((course) => (
            <CourseCard key={course.id} course={course} locale={locale} />
          ))}
        </div>
      </section>

      <section className="section-shell space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="section-title text-3xl font-semibold text-emerald-950">
              {t("Learning paths", "Lo trinh hoc tap")}
            </h2>
            <p className="text-sm text-emerald-800/70">
              {t("Structured journeys to reach your goal.", "Lo trinh co cau truc de dat muc tieu.")}
            </p>
          </div>
          <Link href="/paths" className="text-sm font-semibold text-emerald-800 underline-hover">
            {t("Browse all", "Xem tat ca")}
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 stagger">
          {featuredPaths.length === 0 && (
            <div className="surface-card p-6 text-sm text-emerald-800/70">
              {t("Paths will appear once admin adds them.", "Lo trinh se hien sau khi admin them.")}
            </div>
          )}
          {featuredPaths.map((path) => (
            <LearningPathCard key={path.id} path={path} locale={locale} />
          ))}
        </div>
      </section>

      {!hasCtaBlock && (
        <section className="section-shell">
          <div className="surface-card grid gap-6 p-10 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="space-y-4">
              <h2 className="section-title text-3xl font-semibold text-emerald-950">
                {t("Build a learning journey for your team", "Xay dung hanh trinh hoc tap cho doi ngu")}
              </h2>
              <p className="text-sm text-emerald-800/70">
                {t(
                  "Create cohort-based programs, assign mentors, and track outcomes across every role.",
                  "Tao chuong trinh theo cohort, phan mentor, va theo doi ket qua cho tung vai tro."
                )}
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="badge">{t("Team dashboards", "Dashboard doi ngu")}</span>
                <span className="badge">{t("Skills matrix", "Ma tran ky nang")}</span>
                <span className="badge">{t("Certification", "Chung chi")}</span>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Link
                href="/register"
                className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white"
              >
                {t("Start free trial", "Bat dau dung thu mien phi")}
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
