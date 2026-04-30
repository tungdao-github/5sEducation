"use client";

import Link from "next/link";

type Props = {
  tx: (en: string, vi: string) => string;
  title: string;
  setTitle: (value: string) => void;
  categoryId: string;
  setCategoryId: (value: string) => void;
  level: string;
  setLevel: (value: string) => void;
  categories: Array<{ id: number; title: string }>;
};

export default function StudioCourseIdentityFields({ tx, title, setTitle, categoryId, setCategoryId, level, setLevel, categories }: Props) {
  return (
    <>
      <div className="space-y-2">
        <Link href="/studio" className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Studio
        </Link>
        <h1 className="section-title text-4xl font-semibold text-emerald-950">{tx("Edit course", "Sua khoa hoc")}</h1>
        <p className="text-sm text-emerald-800/70">{tx("Update details and manage lessons.", "Cap nhat thong tin va quan ly bai hoc.")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{tx("Title", "Tieu de")}</label>
          <input value={title} onChange={(e) => setTitle(e.currentTarget.value)} required className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm" />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{tx("Category", "Danh muc")}</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.currentTarget.value)} className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm">
            <option value="">{tx("Select category", "Chon danh muc")}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{tx("Level", "Trinh do")}</label>
          <input value={level} onChange={(e) => setLevel(e.currentTarget.value)} required className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm" />
        </div>
      </div>
    </>
  );
}
