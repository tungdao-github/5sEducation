"use client";

type Props = {
  categories: Array<{ value: string; label: string }>;
  activeCategory: string;
  onSelect: (category: string) => void;
};

export default function BlogCategoryFilters({ categories, activeCategory, onSelect }: Props) {
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onSelect(category.value)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            activeCategory === category.value
              ? "bg-blue-600 text-white"
              : "border border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-600"
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
