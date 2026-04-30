"use client";

import { SurfaceCard } from "@/components/shared/SurfaceCard";
import { resolveApiAsset } from "@/lib/api";

type TestimonialItem = {
  quote: string;
  name: string;
  role?: string;
  company?: string;
  avatarUrl?: string;
};

type Props = {
  title: string;
  subtitle: string;
  items: TestimonialItem[];
  localeText: (en: string, vi: string) => string;
};

export default function HomeTestimonialsBlock({ title, subtitle, items, localeText }: Props) {
  return (
    <section className="section-shell space-y-6">
      <div>
        <span className="section-eyebrow">{subtitle || localeText("Testimonials", "Danh gia")}</span>
        <h2 className="section-title mt-3 text-3xl font-semibold text-emerald-950">{title}</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <SurfaceCard key={`${title}-quote-${index}`} className="space-y-4 p-6">
            <p className="text-sm text-emerald-900">{item.quote}</p>
            <div className="flex items-center gap-3">
              {item.avatarUrl ? (
                <img src={resolveApiAsset(item.avatarUrl)} alt={item.name} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--brand-soft)] text-xs font-semibold text-emerald-900">
                  {item.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-emerald-950">{item.name}</p>
                <p className="text-xs text-emerald-800/70">{[item.role, item.company].filter(Boolean).join(" • ")}</p>
              </div>
            </div>
          </SurfaceCard>
        ))}
        {items.length === 0 && <div className="surface-muted p-4 text-sm text-emerald-800/70">{localeText("Add testimonials in ItemsJson to render this block.", "Them testimonials trong ItemsJson de hien thi block.")}</div>}
      </div>
    </section>
  );
}
