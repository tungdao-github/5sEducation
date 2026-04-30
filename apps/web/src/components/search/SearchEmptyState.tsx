"use client";

import { BookOpen } from "lucide-react";
import { useI18n } from "@/app/providers";

type Props = {
  hasFilters: boolean;
  onClearFilters: () => void;
};

export default function SearchEmptyState({ hasFilters, onClearFilters }: Props) {
  const { tx } = useI18n();

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-16 text-center">
      <BookOpen className="mx-auto mb-4 size-14 text-gray-300" />
      <h3 className="text-lg font-semibold text-gray-700">{tx("No results found", "Không tìm thấy kết quả")}</h3>
      <p className="mt-2 text-sm text-gray-500">{tx("Try another keyword or clear filters to see more courses.", "Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để xem thêm khóa học.")}</p>
      {hasFilters ? (
        <button onClick={onClearFilters} className="mt-5 text-sm font-semibold text-blue-600 hover:underline">
          {tx("Clear all filters", "Xóa tất cả bộ lọc")}
        </button>
      ) : null}
    </div>
  );
}
