import Link from "next/link";
import { API_URL } from "@/lib/api";
import { LearningPathCard, LearningPathSummary } from "@/components/LearningPathCard";
import { getServerLocale } from "@/lib/server-locale";
import { pickLocaleText } from "@/lib/i18n";

async function getLearningPaths(): Promise<LearningPathSummary[]> {
  try {
    const res = await fetch(`${API_URL}/api/learning-paths`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function PathsPage() {
  const locale = await getServerLocale();
  const t = (en: string, vi: string) => pickLocaleText(locale, en, vi);
  const paths = await getLearningPaths();

  return (
    <div className="section-shell space-y-8 py-12 fade-in">
      <div className="space-y-2">
        <Link href="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {t("Home", "Trang chu")}
        </Link>
        <h1 className="section-title text-4xl font-semibold text-emerald-950">
          {t("Learning paths", "Lo trinh hoc tap")}
        </h1>
        <p className="text-sm text-emerald-800/70">
          {t(
            "Follow a structured roadmap to master a role or skill.",
            "Theo lo trinh co cau truc de chinh phuc ky nang."
          )}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {paths.length === 0 && (
          <div className="surface-card p-6 text-sm text-emerald-800/70">
            {t("No learning paths yet.", "Chua co lo trinh hoc tap.")}
          </div>
        )}
        {paths.map((path) => (
          <LearningPathCard key={path.id} path={path} locale={locale} />
        ))}
      </div>
    </div>
  );
}
