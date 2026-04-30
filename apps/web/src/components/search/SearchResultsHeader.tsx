"use client";

import { useI18n } from "@/app/providers";

type Props = {
  query: string;
  sortedLength: number;
  sortBy: string;
  onSortChange: (value: string) => void;
};

export default function SearchResultsHeader({ query, sortedLength, sortBy, onSortChange }: Props) {
  const { tx } = useI18n();

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-gray-600">
        {query ? <span className="font-medium text-gray-950">“{query}” · </span> : null}
        {tx("Found", "Tìm thấy")} <span className="font-semibold text-gray-950">{sortedLength}</span> {tx("courses", "khóa học")}
      </p>
      <select
        value={sortBy}
        onChange={(event) => onSortChange(event.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="popular">{tx("Most popular", "Phổ biến nhất")}</option>
        <option value="rating">{tx("Highest rated", "Đánh giá cao nhất")}</option>
        <option value="newest">{tx("Newest", "Mới nhất")}</option>
        <option value="priceAsc">{tx("Price low to high", "Giá tăng dần")}</option>
        <option value="priceDesc">{tx("Price high to low", "Giá giảm dần")}</option>
      </select>
    </div>
  );
}
