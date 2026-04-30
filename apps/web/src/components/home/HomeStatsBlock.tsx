"use client";

type StatItem = {
  value: string;
  label: string;
  subLabel?: string;
};

type Props = {
  title: string;
  subtitle: string;
  stats: StatItem[];
  localeText: (en: string, vi: string) => string;
};

export default function HomeStatsBlock({ title, subtitle, stats, localeText }: Props) {
  return (
    <section className="section-shell space-y-6">
      <div>
        <span className="section-eyebrow">{subtitle || localeText("Highlights", "Noi bat")}</span>
        <h2 className="section-title mt-3 text-3xl font-semibold text-emerald-950">{title}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={`${title}-stat-${index}`} className="stat-pill">
            <p className="text-lg font-semibold text-emerald-950">{stat.value}</p>
            <p>{stat.label}</p>
            {stat.subLabel && <p className="text-xs text-emerald-800/70">{stat.subLabel}</p>}
          </div>
        ))}
        {stats.length === 0 && (
          <div className="surface-muted p-4 text-sm text-emerald-800/70">{localeText("Add stats in ItemsJson to render this block.", "Them stats trong ItemsJson de hien thi block.")}</div>
        )}
      </div>
    </section>
  );
}
