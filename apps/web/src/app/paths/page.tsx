import Link from "next/link";
import type { Metadata } from "next";
import { LearningPathCard, LearningPathSummary } from "@/components/LearningPathCard";
import { PageIntro } from "@/components/shared/PageIntro";
import { SurfaceCard } from "@/components/shared/SurfaceCard";
import { getServerLocale } from "@/lib/server-locale";
import { pickLocaleText } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { fetchLearningPaths } from "@/services/api";
import type { LearningPathListDto } from "@/services/api";

export const metadata: Metadata = buildMetadata({
  title: "Lo trinh hoc tap",
  description: "Theo hoc lo trinh co cau truc de chinh phuc UX/UI Design va cac ky nang lien quan.",
  path: "/paths",
  type: "website",
  keywords: ["lo trinh hoc tap", "UX/UI roadmap", "EduCourse"],
});

async function getLearningPaths(): Promise<LearningPathSummary[]> {
  try {
    const paths = await fetchLearningPaths();
    return paths.map((path: LearningPathListDto): LearningPathSummary => ({
      id: path.id,
      title: path.title,
      slug: path.slug,
      description: path.description,
      level: path.level,
      thumbnailUrl: path.thumbnailUrl ?? "",
      estimatedHours: path.estimatedHours ?? 0,
      courseCount: path.courseCount,
    }));
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
      <PageIntro
        backLink={{ href: "/", label: t("Home", "Trang chu") }}
        title={t("Learning paths", "Lo trinh hoc tap")}
        description={t(
          "Follow a structured roadmap to master a role or skill.",
          "Theo lo trinh co cau truc de chinh phuc ky nang."
        )}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {paths.length === 0 && (
          <SurfaceCard className="p-6 text-sm text-emerald-800/70">
            {t("No learning paths yet.", "Chua co lo trinh hoc tap.")}
          </SurfaceCard>
        )}
        {paths.map((path) => (
          <LearningPathCard key={path.id} path={path} locale={locale} />
        ))}
      </div>
    </div>
  );
}

