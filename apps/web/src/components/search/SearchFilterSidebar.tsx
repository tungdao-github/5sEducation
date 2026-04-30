"use client";

import { useI18n } from "@/app/providers";
import type { CategoryDto } from "@/services/api";

type PriceFilter = "all" | "free" | "under200" | "200-400" | "over400";
type DurationFilter = "all" | "under3h" | "3-6h" | "6-12h" | "over12h";
type LanguageFilter = "all" | "vietnamese" | "english";

type Props = {
  showFilters: boolean;
  hasFilters: boolean;
  categories: CategoryDto[];
  selectedCategory: string;
  onSelectCategory: (value: string) => void;
  selectedLevel: string;
  onSelectLevel: (value: string) => void;
  priceFilter: PriceFilter;
  onSelectPrice: (value: PriceFilter) => void;
  durationFilter: DurationFilter;
  onSelectDuration: (value: DurationFilter) => void;
  languageFilter: LanguageFilter;
  onSelectLanguage: (value: LanguageFilter) => void;
  minRating: number;
  onSelectRating: (value: number) => void;
  onClearFilters: () => void;
};

export type { PriceFilter, DurationFilter, LanguageFilter };

export default function SearchFilterSidebar({
  showFilters,
  hasFilters,
  categories,
  selectedCategory,
  onSelectCategory,
  selectedLevel,
  onSelectLevel,
  priceFilter,
  onSelectPrice,
  durationFilter,
  onSelectDuration,
  languageFilter,
  onSelectLanguage,
  minRating,
  onSelectRating,
  onClearFilters,
}: Props) {
  const { tx } = useI18n();

  if (!showFilters) return null;

  const levels = [
    { value: "all", label: tx("All", "Tất cả") },
    { value: "Beginner", label: tx("Beginner", "Sơ cấp") },
    { value: "Intermediate", label: tx("Intermediate", "Trung cấp") },
    { value: "Advanced", label: tx("Advanced", "Nâng cao") },
    { value: "All Levels", label: tx("All levels", "Phù hợp mọi trình độ") },
    { value: "All levels", label: tx("All levels", "Phù hợp mọi trình độ") },
  ] as const;

  return (
    <aside className="hidden min-w-0 sm:block">
      <div className="sticky top-20 rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">{tx("Advanced filters", "Bộ lọc nâng cao")}</h3>
          {hasFilters ? (
            <button onClick={onClearFilters} className="text-xs text-blue-600 hover:underline">
              {tx("Clear all", "Xóa tất cả")}
            </button>
          ) : null}
        </div>

        <FilterGroup title={tx("Category", "Danh mục")}>
          {[{ title: tx("All", "Tất cả"), slug: "all" }, ...categories].map((category) => (
            <Choice
              key={category.slug}
              checked={selectedCategory === category.slug}
              onChange={() => onSelectCategory(category.slug)}
              label={category.title}
              name="category"
            />
          ))}
        </FilterGroup>

        <FilterGroup title={tx("Level", "Trình độ")}>
          {levels.map((level) => (
            <Choice
              key={level.value}
              checked={selectedLevel === level.value}
              onChange={() => onSelectLevel(level.value)}
              label={level.label}
              name="level"
            />
          ))}
        </FilterGroup>

        <FilterGroup title={tx("Price", "Mức giá")}>
          {[
            { value: "all", label: tx("All", "Tất cả") },
            { value: "free", label: tx("Free", "Miễn phí") },
            { value: "under200", label: tx("Under 200K", "Dưới 200Kđ") },
            { value: "200-400", label: tx("200K - 400K", "200Kđ - 400Kđ") },
            { value: "over400", label: tx("Over 400K", "Trên 400Kđ") },
          ].map((item) => (
            <Choice
              key={item.value}
              checked={priceFilter === item.value}
              onChange={() => onSelectPrice(item.value as PriceFilter)}
              label={item.label}
              name="price"
            />
          ))}
        </FilterGroup>

        <FilterGroup title={tx("Duration", "Thời lượng")}>
          {[
            { value: "all", label: tx("All", "Tất cả") },
            { value: "under3h", label: tx("Under 3 hours", "Dưới 3 giờ") },
            { value: "3-6h", label: tx("3-6 hours", "3-6 giờ") },
            { value: "6-12h", label: tx("6-12 hours", "6-12 giờ") },
            { value: "over12h", label: tx("Over 12 hours", "Trên 12 giờ") },
          ].map((item) => (
            <Choice
              key={item.value}
              checked={durationFilter === item.value}
              onChange={() => onSelectDuration(item.value as DurationFilter)}
              label={item.label}
              name="duration"
            />
          ))}
        </FilterGroup>

        <FilterGroup title={tx("Language", "Ngôn ngữ")}>
          {[
            { value: "all", label: tx("All", "Tất cả") },
            { value: "vietnamese", label: tx("Vietnamese", "Tiếng Việt") },
            { value: "english", label: tx("English", "Tiếng Anh") },
          ].map((item) => (
            <Choice
              key={item.value}
              checked={languageFilter === item.value}
              onChange={() => onSelectLanguage(item.value as LanguageFilter)}
              label={item.label}
              name="language"
            />
          ))}
        </FilterGroup>

        <FilterGroup title={tx("Minimum rating", "Đánh giá tối thiểu")}>
          {[0, 4, 4.5, 4.8].map((rating) => (
            <Choice
              key={rating}
              checked={minRating === rating}
              onChange={() => onSelectRating(rating)}
              label={rating === 0 ? tx("All", "Tất cả") : `${rating}★ ${tx("and up", "trở lên")}`}
              name="rating"
            />
          ))}
        </FilterGroup>
      </div>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Choice({
  checked,
  label,
  name,
  onChange,
}: {
  checked: boolean;
  label: string;
  name: string;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg px-1 py-1 text-sm text-gray-600 transition hover:text-gray-950">
      <input type="radio" checked={checked} name={name} onChange={onChange} className="size-4 accent-blue-600" />
      <span>{label}</span>
    </label>
  );
}
