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

export function HomeBlocks({ blocks, locale }: HomeBlocksProps) {
  const t = (en: string, vi: string) => pickLocaleText(locale, en, vi);

  return (
    <>
      {blocks.map((block) => {
        const type = block.type.toLowerCase();
        const items = parseItems(block.itemsJson);

        if (type === "hero") {
          return (
            <section key={block.id} className="hero-grid fade-in">
              <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.2fr,0.8fr]">
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
                <div className="glass-card flex flex-col gap-6 rounded-3xl p-6">
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
            <section key={block.id} className="mx-auto w-full max-w-6xl px-6">
              <div className="glass-card grid gap-6 rounded-3xl p-10 lg:grid-cols-[1.2fr,0.8fr]">
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
            <section key={block.id} className="mx-auto w-full max-w-6xl space-y-6 px-6">
              <div>
                <h2 className="section-title text-3xl font-semibold text-emerald-950">{block.title}</h2>
                <p className="text-sm text-emerald-800/70">{block.subtitle}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <div key={item} className="glass-card rounded-2xl p-6 text-sm text-emerald-900">
                    {item}
                  </div>
                ))}
              </div>
            </section>
          );
        }

        return null;
      })}
    </>
  );
}
