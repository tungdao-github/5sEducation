"use client";

import type { Dispatch, SetStateAction } from "react";
import { Check, X } from "lucide-react";
import { useI18n } from "@/app/providers";
import BlogPostBasicFields from "@/components/admin/blog/BlogPostBasicFields";
import BlogPostSeoFields from "@/components/admin/blog/BlogPostSeoFields";
import BlogPostStatusToggle from "@/components/admin/blog/BlogPostStatusToggle";

export type BlogFormState = {
  title: string;
  summary: string;
  content: string;
  authorName: string;
  tags: string;
  locale: string;
  coverImageUrl: string;
  isPublished: boolean;
  seoTitle: string;
  seoDescription: string;
  slug: string;
};

type Props = {
  editingId: number | null;
  form: BlogFormState;
  setForm: Dispatch<SetStateAction<BlogFormState>>;
  saving: boolean;
  onSubmit: () => void;
  onCancel: () => void;
};

export const defaultBlogForm: BlogFormState = {
  title: "",
  summary: "",
  content: "",
  authorName: "",
  tags: "",
  locale: "vi",
  coverImageUrl: "",
  isPublished: true,
  seoTitle: "",
  seoDescription: "",
  slug: "",
};

export default function BlogPostForm({ editingId, form, setForm, saving, onSubmit, onCancel }: Props) {
  const { tx } = useI18n();
  return (
    <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{editingId ? tx("Edit post", "Sửa bài viết") : tx("New post", "Viết bài mới")}</h3>
        <button onClick={onCancel}>
          <X className="size-5 text-gray-400" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <BlogPostBasicFields form={form} setForm={setForm} />
        <BlogPostSeoFields form={form} setForm={setForm} />
        <BlogPostStatusToggle form={form} setForm={setForm} />
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={onSubmit}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          <Check className="size-4" /> {saving ? tx("Saving...", "Đang lưu...") : editingId ? tx("Update", "Cập nhật") : tx("Publish", "Đăng bài")}
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-5 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
        >
          {tx("Cancel", "Hủy")}
        </button>
      </div>
    </div>
  );
}
