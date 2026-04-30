"use client";

import Link from "next/link";

type Category = {
  id: number;
  title: string;
  slug: string;
};

type Props = {
  categories: Category[];
  noCategoriesLabel: string;
  browseAllLabel: string;
};

export default function SideNavCategoryList({ categories, noCategoriesLabel, browseAllLabel }: Props) {
  return (
    <div className="flex flex-wrap gap-2 px-1">
      {categories.length === 0 ? (
        <span className="text-xs text-slate-400">{noCategoriesLabel}</span>
      ) : (
        categories.map((category) => (
          <Link
            key={category.id}
            href={`/courses?category=${category.slug}`}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:border-blue-200 hover:text-blue-700"
          >
            {category.title}
          </Link>
        ))
      )}

      <Link href="/courses" className="inline-flex items-center gap-2 px-3 text-xs font-semibold text-blue-700">
        {browseAllLabel}
      </Link>
    </div>
  );
}
