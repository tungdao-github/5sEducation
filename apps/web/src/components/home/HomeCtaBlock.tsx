"use client";

import Link from "next/link";
import { SurfaceCard } from "@/components/shared/SurfaceCard";

type Props = {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
  items: string[];
  localeText: (en: string, vi: string) => string;
};

export default function HomeCtaBlock({ title, subtitle, ctaText, ctaUrl, items, localeText }: Props) {
  return (
    <>
      <section className="section-shell">
        <SurfaceCard className="grid gap-6 p-10 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-4">
            <h2 className="section-title text-3xl font-semibold text-emerald-950">{title}</h2>
            <p className="text-sm text-emerald-800/70">{subtitle}</p>
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
            <Link href={ctaUrl || "/?auth=register&next=%2Fmy-learning"} className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white">
              {ctaText || localeText("Start", "Bat dau")}
            </Link>
          </div>
        </SurfaceCard>
      </section>
    </>
  );
}
