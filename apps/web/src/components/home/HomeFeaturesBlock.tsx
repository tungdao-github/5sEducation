"use client";

import { SurfaceCard } from "@/components/shared/SurfaceCard";

type Props = {
  title: string;
  subtitle: string;
  items: string[];
};

export default function HomeFeaturesBlock({ title, subtitle, items }: Props) {
  return (
    <section className="section-shell space-y-6">
      <div>
        <h2 className="section-title text-3xl font-semibold text-emerald-950">{title}</h2>
        <p className="text-sm text-emerald-800/70">{subtitle}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <SurfaceCard key={item} className="p-6 text-sm text-emerald-900">
            {item}
          </SurfaceCard>
        ))}
      </div>
    </section>
  );
}
