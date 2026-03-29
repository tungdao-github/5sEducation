import Link from "next/link";
import { resolveApiAsset } from "@/lib/api";
import { pickLocaleText } from "@/lib/i18n";

export type LearningPathSummary = {
  id: number;
  title: string;
  slug: string;
  description: string;
  level: string;
  thumbnailUrl: string;
  estimatedHours: number;
  courseCount: number;
};

type LearningPathCardProps = {
  path: LearningPathSummary;
  locale: "en" | "vi";
};

export function LearningPathCard({ path, locale }: LearningPathCardProps) {
  const t = (en: string, vi: string) => pickLocaleText(locale, en, vi);

  return (
    <Link
      href={`/paths/${path.slug}`}
      className="glass-card flex h-full flex-col gap-4 rounded-3xl p-5 transition hover:-translate-y-1"
    >
      <div className="overflow-hidden rounded-2xl bg-emerald-900/5">
        <img
          src={resolveApiAsset(path.thumbnailUrl)}
          alt={path.title}
          className="h-40 w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <h3 className="text-base font-semibold text-emerald-950">{path.title}</h3>
        <p className="text-sm text-emerald-800/70">{path.description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-emerald-800/80">
        <span className="rounded-full border border-emerald-200 px-3 py-1">{path.level || t("Beginner", "Co ban")}</span>
        <span className="rounded-full border border-emerald-200 px-3 py-1">
          {path.courseCount} {t("courses", "khoa hoc")}
        </span>
        {path.estimatedHours > 0 && (
          <span className="rounded-full border border-emerald-200 px-3 py-1">
            {path.estimatedHours}h
          </span>
        )}
      </div>
    </Link>
  );
}
