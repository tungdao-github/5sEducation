"use client";

import { Plus, Search } from "lucide-react";
import { useI18n } from "@/app/providers";

type Props = {
  search: string;
  setSearch: (value: string) => void;
  onCreateNew: () => void;
};

export default function BlogTabToolbar({ search, setSearch, onCreateNew }: Props) {
  const { tx } = useI18n();
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tx("Search posts...", "Tìm bài viết...")}
          className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        onClick={onCreateNew}
        className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        <Plus className="size-4" /> {tx("New post", "Viết bài mới")}
      </button>
    </div>
  );
}
