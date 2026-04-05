import Link from "next/link";
import { pickLocaleText } from "@/lib/i18n";
import { resolveApiAsset } from "@/lib/api";

export type HomePageBlock = {
  id: number;
  key: string;
  type: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaUrl: string;
  itemsJson: string;
  locale: string;
  sortOrder: number;
};

type StatItem = {
  value: string;
  label: string;
  subLabel?: string;
};

type TestimonialItem = {
  quote: string;
  name: string;
  role?: string;
  company?: string;
  avatarUrl?: string;
};

type HomeBlocksProps = {
  blocks: HomePageBlock[];
  locale: "en" | "vi";
};

const parseItems = (input: string): string[] => {
  if (!input) return [];
  try {
    const data = JSON.parse(input);
    if (Array.isArray(data)) {
      return data.filter((item) => typeof item === "string");
    }
  } catch {
    return [];
  }
  return [];
};

const parseObjectItems = <T,>(input: string, guard: (item: unknown) => item is T): T[] => {
  if (!input) return [];
  try {
    const data = JSON.parse(input);
    if (Array.isArray(data)) {
      return data.filter(guard);
    }
  } catch {
    return [];
  }
  return [];
};

const isStatItem = (item: unknown): item is StatItem => {
  if (!item || typeof item !== "object") return false;
  const record = item as Record<string, unknown>;
  return typeof record.value === "string" && typeof record.label === "string";
};

const isTestimonialItem = (item: unknown): item is TestimonialItem => {
  if (!item || typeof item !== "object") return false;
  const record = item as Record<string, unknown>;
  return typeof record.quote === "string" && typeof record.name === "string";
};

export function HomeBlocks({ blocks, locale }: HomeBlocksProps) {
  const t = (en: string, vi: string) => pickLocaleText(locale, en, vi);

  return (
    <>
      {blocks.map((block) => {
        const type = block.type.toLowerCase();
        const items = parseItems(block.itemsJson);
        const stats = parseObjectItems(block.itemsJson, isStatItem);
        const testimonials = parseObjectItems(block.itemsJson, isTestimonialItem);

        if (type === "hero") {
          return (
            <section key={block.id} className="hero-grid fade-in">
              <div className="section-shell grid gap-10 py-16 lg:grid-cols-[1.2fr,0.8fr]">
                <div className="space-y-6">
                  <span className="badge">{t("New season", "Mua hoc moi")}</span>
                  <h1 className="section-title text-4xl font-semibold text-emerald-950 md:text-5xl">
                    {block.title}
                  </h1>
                  <p className="text-lg text-emerald-800/70">{block.subtitle}</p>
                  <div className="flex flex-wrap gap-3">
                    {items.map((item) => (
                      <span key={item} className="badge">
                        {item}
                      </span>
                    ))}
                  </div>
                  {block.ctaText && (
                    <Link
                      href={block.ctaUrl || "/paths"}
                      className="inline-flex rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white"
                    >
                      {block.ctaText}
                    </Link>
                  )}
                </div>
                <div className="surface-card flex flex-col gap-6 rounded-3xl p-6">
                  {block.imageUrl && (
                    <div className="overflow-hidden rounded-2xl bg-emerald-900/5">
                      <img
                        src={resolveApiAsset(block.imageUrl)}
                        alt={block.title}
                        className="h-44 w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                      {t("Featured", "Noi bat")}
                    </p>
                    <h2 className="text-2xl font-semibold text-emerald-950">
                      {t("Weekly studio brief", "Ban tin studio hang tuan")}
                    </h2>
                    <p className="text-sm text-emerald-800/70">
                      {t(
                        "Join a short sprint guided by real product teams.",
                        "Tham gia sprint ngan duoc huong dan boi doi ngu san pham thuc te."
                      )}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-emerald-900/5 p-4">
                    <p className="text-sm font-semibold text-emerald-900">
                      {t("Next cohort starts", "Khai giang dot tiep theo")}
                    </p>
                    <p className="text-3xl font-semibold text-emerald-950">Apr 12</p>
                    <p className="text-xs text-emerald-800/70">
                      {t("Limited seats", "Cho ngoi gioi han")}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        if (type === "cta") {
          return (
            <section key={block.id} className="section-shell">
              <div className="surface-card grid gap-6 rounded-3xl p-10 lg:grid-cols-[1.2fr,0.8fr]">
                <div className="space-y-4">
                  <h2 className="section-title text-3xl font-semibold text-emerald-950">{block.title}</h2>
                  <p className="text-sm text-emerald-800/70">{block.subtitle}</p>
                  {items.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {items.map((item) => (
                        <span key={item} className="badge">
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center">
                  <Link
                    href={block.ctaUrl || "/register"}
                    className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white"
                  >
                    {block.ctaText || t("Start", "Bat dau")}
                  </Link>
                </div>
              </div>
            </section>
          );
        }

        if (type === "feature") {
          return (
            <section key={block.id} className="section-shell space-y-6">
              <div>
                <h2 className="section-title text-3xl font-semibold text-emerald-950">{block.title}</h2>
                <p className="text-sm text-emerald-800/70">{block.subtitle}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <div key={item} className="surface-card rounded-2xl p-6 text-sm text-emerald-900">
                    {item}
                  </div>
                ))}
              </div>
            </section>
          );
        }

        if (type === "stats") {
          return (
            <section key={block.id} className="section-shell space-y-6">
              <div>
                <span className="section-eyebrow">{block.subtitle || t("Highlights", "Noi bat")}</span>
                <h2 className="section-title mt-3 text-3xl font-semibold text-emerald-950">{block.title}</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                  <div key={`${block.id}-stat-${index}`} className="stat-pill">
                    <p className="text-lg font-semibold text-emerald-950">{stat.value}</p>
                    <p>{stat.label}</p>
                    {stat.subLabel && <p className="text-xs text-emerald-800/70">{stat.subLabel}</p>}
                  </div>
                ))}
                {stats.length === 0 && (
                  <div className="surface-muted p-4 text-sm text-emerald-800/70">
                    {t("Add stats in ItemsJson to render this block.", "Them stats trong ItemsJson de hien thi block.")}
                  </div>
                )}
              </div>
            </section>
          );
        }

        if (type === "testimonial") {
          return (
            <section key={block.id} className="section-shell space-y-6">
              <div>
                <span className="section-eyebrow">{block.subtitle || t("Testimonials", "Danh gia")}</span>
                <h2 className="section-title mt-3 text-3xl font-semibold text-emerald-950">{block.title}</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((item, index) => (
                  <div key={`${block.id}-quote-${index}`} className="surface-card space-y-4 p-6">
                    <p className="text-sm text-emerald-900">{item.quote}</p>
                    <div className="flex items-center gap-3">
                      {item.avatarUrl ? (
                        <img
                          src={resolveApiAsset(item.avatarUrl)}
                          alt={item.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--brand-soft)] text-xs font-semibold text-emerald-900">
                          {item.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-emerald-950">{item.name}</p>
                        <p className="text-xs text-emerald-800/70">
                          {[item.role, item.company].filter(Boolean).join(" • ")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {testimonials.length === 0 && (
                  <div className="surface-muted p-4 text-sm text-emerald-800/70">
                    {t("Add testimonials in ItemsJson to render this block.", "Them testimonials trong ItemsJson de hien thi block.")}
                  </div>
                )}
              </div>
            </section>
          );
        }

        return null;
      })}
    </>
  );
}

