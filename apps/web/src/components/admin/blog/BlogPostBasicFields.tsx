"use client";

import type { Dispatch, SetStateAction } from "react";
import { useI18n } from "@/app/providers";
import type { BlogFormState } from "@/components/admin/blog/BlogPostForm";

type Props = {
  form: BlogFormState;
  setForm: Dispatch<SetStateAction<BlogFormState>>;
};

export default function BlogPostBasicFields({ form, setForm }: Props) {
  const { tx } = useI18n();

  return (
    <>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Title *", "Tiêu đề *")}</label>
        <input
          value={form.title}
          onChange={(e) => setForm((current) => ({ ...current, title: e.currentTarget.value }))}
          placeholder={tx("Post title", "Tiêu đề bài viết")}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Author *", "Tác giả *")}</label>
        <input
          value={form.authorName}
          onChange={(e) => setForm((current) => ({ ...current, authorName: e.currentTarget.value }))}
          placeholder={tx("Author name", "Tên tác giả")}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Language", "Ngôn ngữ")}</label>
        <select
          value={form.locale}
          onChange={(e) => setForm((current) => ({ ...current, locale: e.currentTarget.value }))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="vi">{tx("Vietnamese", "Tiếng Việt")}</option>
          <option value="en">{tx("English", "English")}</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Summary *", "Mô tả ngắn *")}</label>
        <textarea
          value={form.summary}
          onChange={(e) => setForm((current) => ({ ...current, summary: e.currentTarget.value }))}
          rows={2}
          placeholder={tx("Short post summary...", "Mô tả tóm tắt bài viết...")}
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Content (HTML) *", "Nội dung (HTML) *")}</label>
        <textarea
          value={form.content}
          onChange={(e) => setForm((current) => ({ ...current, content: e.currentTarget.value }))}
          rows={6}
          placeholder={tx("<p>Post content...</p>", "<p>Nội dung bài viết...</p>")}
          className="font-mono w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Tags", "Thẻ")}</label>
        <input
          value={form.tags}
          onChange={(e) => setForm((current) => ({ ...current, tags: e.currentTarget.value }))}
          placeholder="UX, Design, UI"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Slug URL", "Đường dẫn slug")}</label>
        <input
          value={form.slug}
          onChange={(e) => setForm((current) => ({ ...current, slug: e.currentTarget.value }))}
          placeholder="tieu-de-bai-viet"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </>
  );
}
