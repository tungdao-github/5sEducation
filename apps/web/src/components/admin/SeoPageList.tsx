"use client";

import { Search } from "lucide-react";
import { useI18n } from "@/app/providers";
import type { SEOPage } from "@/components/admin/seoTypes";

type Props = {
  pages: SEOPage[];
  onEdit: (page: SEOPage) => void;
};

export default function SeoPageList({ pages, onEdit }: Props) {
  const { tx } = useI18n();

  return (
    <div className="space-y-3">
      {pages.map((page) => (
        <div key={page.id} className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Search className="size-4 text-blue-600" />
                <h4 className="font-semibold text-gray-900">{page.page}</h4>
              </div>
              <p className="text-xs text-gray-500">{page.url}</p>
            </div>
            <button onClick={() => onEdit(page)} className="text-sm text-blue-600 hover:underline">
              {tx("Edit", "Chỉnh sửa")}
            </button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">{tx("Title", "Tiêu đề")}</p>
              <p className="text-sm text-gray-900">{page.title}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">{tx("Description", "Mô tả")}</p>
              <p className="line-clamp-2 text-sm text-gray-900">{page.description}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">{tx("Keywords", "Từ khóa")}</p>
              <p className="text-sm text-gray-900">{page.keywords}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">{tx("Score", "Đánh giá")}</p>
              <p className="text-sm font-semibold text-blue-600">{page.score}/100</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
