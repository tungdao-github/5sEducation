"use client";

import { useI18n } from "@/app/providers";
import type { SEOPage } from "@/components/admin/seoTypes";

type Props = {
  open: boolean;
  form: Partial<SEOPage>;
  saving: boolean;
  onChange: (updater: (current: Partial<SEOPage>) => Partial<SEOPage>) => void;
  onSave: () => void;
  onCancel: () => void;
};

export default function SeoEditorCard({ open, form, saving, onChange, onSave, onCancel }: Props) {
  const { tx } = useI18n();
  if (!open) return null;

  return (
    <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
        <h4 className="mb-4 font-semibold text-gray-900">{tx("Edit SEO", "Chỉnh sửa SEO")}</h4>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Meta title", "Tiêu đề meta")}</label>
          <input value={form.title || ""} onChange={(e) => onChange((current) => ({ ...current, title: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Meta description", "Mô tả meta")}</label>
          <textarea value={form.description || ""} onChange={(e) => onChange((current) => ({ ...current, description: e.target.value }))} rows={3} className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Keywords", "Từ khóa")}</label>
          <input value={form.keywords || ""} onChange={(e) => onChange((current) => ({ ...current, keywords: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Open Graph title", "Tiêu đề Open Graph")}</label>
            <input value={form.ogTitle || ""} onChange={(e) => onChange((current) => ({ ...current, ogTitle: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Open Graph image URL", "URL ảnh Open Graph")}</label>
            <input value={form.ogImage || ""} onChange={(e) => onChange((current) => ({ ...current, ogImage: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onSave} disabled={saving} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60">
            {tx("Save", "Lưu")}
          </button>
          <button onClick={onCancel} className="rounded-lg border border-gray-300 px-5 py-2 text-sm text-gray-600 transition hover:bg-gray-50">
            {tx("Cancel", "Hủy")}
          </button>
        </div>
      </div>
    </div>
  );
}
