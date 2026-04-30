"use client";

import { useI18n } from "@/app/providers";
import type { Dispatch, SetStateAction } from "react";
import type { BlogFormState } from "@/components/admin/blog/BlogPostForm";

type Props = {
  form: BlogFormState;
  setForm: Dispatch<SetStateAction<BlogFormState>>;
};

export default function BlogPostStatusToggle({ form, setForm }: Props) {
  const { tx } = useI18n();
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-700">{tx("Status:", "Trạng thái:")}</label>
      <button
        onClick={() => setForm((current) => ({ ...current, isPublished: !current.isPublished }))}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
          form.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
        }`}
      >
        {form.isPublished ? tx("Published", "Xuất bản") : tx("Draft", "Bản nháp")}
      </button>
    </div>
  );
}
