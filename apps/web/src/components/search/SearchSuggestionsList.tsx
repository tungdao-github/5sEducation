"use client";

import type { SearchSuggestionDto } from "@/services/api";

type Props = {
  items: SearchSuggestionDto[];
  loading: boolean;
  tx: (en: string, vi: string) => string;
  onSelect: (item: SearchSuggestionDto) => void;
};

export default function SearchSuggestionsList({ items, loading, tx, onSelect }: Props) {
  const paths = items.filter((item) => item.type === "path");
  const courses = items.filter((item) => item.type === "course");

  return (
    <div className="absolute left-0 right-0 top-full z-40 mt-2 rounded-2xl border border-[color:var(--stroke)] bg-white p-2 shadow-lg">
      {loading ? <div className="px-3 py-2 text-xs text-gray-500">{tx("Searching...", "Đang tìm...")}</div> : null}
      {!loading && items.length === 0 ? <div className="px-3 py-2 text-xs text-gray-500">{tx("No matches yet.", "Chưa có gợi ý.")}</div> : null}

      {paths.length > 0 ? <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600">{tx("Paths", "Lộ trình")}</div> : null}
      {paths.map((item) => (
        <button
          key={`path-${item.slug}`}
          type="button"
          onClick={() => onSelect(item)}
          className="flex w-full flex-col gap-1 rounded-xl px-3 py-2 text-left text-xs font-semibold text-gray-900 hover:bg-blue-50"
        >
          <span>{item.title}</span>
          {item.subtitle ? <span className="text-[11px] text-gray-500">{item.subtitle}</span> : null}
        </button>
      ))}

      {courses.length > 0 ? <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600">{tx("Courses", "Khóa học")}</div> : null}
      {courses.map((item) => (
        <button
          key={`course-${item.slug}`}
          type="button"
          onClick={() => onSelect(item)}
          className="flex w-full flex-col gap-1 rounded-xl px-3 py-2 text-left text-xs font-semibold text-gray-900 hover:bg-blue-50"
        >
          <span>{item.title}</span>
          {item.subtitle ? <span className="text-[11px] text-gray-500">{item.subtitle}</span> : null}
        </button>
      ))}
    </div>
  );
}
