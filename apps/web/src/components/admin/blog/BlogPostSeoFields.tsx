"use client";

import type { Dispatch, SetStateAction } from "react";
import { useI18n } from "@/app/providers";
import type { BlogFormState } from "@/components/admin/blog/BlogPostForm";

type Props = {
  form: BlogFormState;
  setForm: Dispatch<SetStateAction<BlogFormState>>;
};

export default function BlogPostSeoFields({ form, setForm }: Props) {
  const { tx } = useI18n();

  return (
    <>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Cover image", "Ảnh đại diện")}</label>
        <input
          value={form.coverImageUrl}
          onChange={(e) => setForm((current) => ({ ...current, coverImageUrl: e.currentTarget.value }))}
          placeholder="https://..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{tx("SEO title", "SEO Title")}</label>
        <input
          value={form.seoTitle}
          onChange={(e) => setForm((current) => ({ ...current, seoTitle: e.currentTarget.value }))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{tx("SEO description", "SEO Description")}</label>
        <input
          value={form.seoDescription}
          onChange={(e) => setForm((current) => ({ ...current, seoDescription: e.currentTarget.value }))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </>
  );
}
