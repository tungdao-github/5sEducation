"use client";

import Link from "next/link";
import { ArrowRight, Award } from "lucide-react";
import { SurfaceCard } from "@/components/shared/SurfaceCard";
import { resolveApiAsset } from "@/lib/api";
import type { AppLocale } from "@/lib/i18n";
import { pickLocaleText } from "@/lib/i18n";

type Props = {
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaUrl: string;
  items: string[];
  locale: AppLocale;
};

export default function HomeHeroBlock({ title, subtitle, imageUrl, ctaText, ctaUrl, items, locale }: Props) {
  const t = (en: string, vi: string) => pickLocaleText(locale, en, vi);

  return (
    <section className="hero-grid fade-in">
      <div className="section-shell grid gap-10 py-16 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-6">
          <span className="badge">{t("New season", "Mua hoc moi")}</span>
          <h1 className="section-title text-4xl font-semibold text-emerald-950 md:text-5xl">{title}</h1>
          <p className="text-lg text-emerald-800/70">{subtitle}</p>
          <div className="flex flex-wrap gap-3">
            {items.map((item) => (
              <span key={item} className="badge">
                {item}
              </span>
            ))}
          </div>
          {ctaText && (
            <Link href={ctaUrl || "/paths"} className="inline-flex rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white">
              {ctaText}
            </Link>
          )}
        </div>
        <SurfaceCard className="flex flex-col gap-6 p-6">
          {imageUrl && (
            <div className="overflow-hidden rounded-2xl bg-emerald-900/5">
              <img src={resolveApiAsset(imageUrl)} alt={title} className="h-44 w-full object-cover" />
            </div>
          )}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{t("Featured", "Noi bat")}</p>
            <h2 className="text-2xl font-semibold text-emerald-950">{t("Weekly studio brief", "Ban tin studio hang tuan")}</h2>
            <p className="text-sm text-emerald-800/70">
              {t("Join a short sprint guided by real product teams.", "Tham gia sprint ngan duoc huong dan boi doi ngu san pham thuc te.")}
            </p>
          </div>
          <div className="rounded-2xl bg-emerald-900/5 p-4">
            <p className="text-sm font-semibold text-emerald-900">{t("Next cohort starts", "Khai giang dot tiep theo")}</p>
            <p className="text-3xl font-semibold text-emerald-950">Apr 12</p>
            <p className="text-xs text-emerald-800/70">{t("Limited seats", "Cho ngoi gioi han")}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-700">
            <Award className="size-4" />
            <span>{t("Trusted by 1,200+ learners", "Duoc hon 1,200 hoc vien tin tuong")}</span>
          </div>
        </SurfaceCard>
      </div>
    </section>
  );
}
