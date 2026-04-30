"use client";

import { Mic, MicOff, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";

type Props = {
  query: string;
  placeholder: string;
  isListening: boolean;
  showFilters: boolean;
  hasFilters: boolean;
  onQueryChange: (value: string) => void;
  onClearQuery: () => void;
  onVoiceSearch: () => void;
  onToggleFilters: () => void;
};

export default function SearchToolbar({
  query,
  placeholder,
  isListening,
  showFilters,
  hasFilters,
  onQueryChange,
  onClearQuery,
  onVoiceSearch,
  onToggleFilters,
}: Props) {
  return (
    <>
      <section className="border-b border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <Sparkles className="size-3.5" />
                Tìm kiếm khóa học
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-gray-950 sm:text-4xl">
                Khám phá khóa học phù hợp
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
                Lọc theo danh mục, trình độ, mức giá và đánh giá để tìm nhanh khóa học phù hợp nhất.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <span className="rounded-full bg-gray-100 px-3 py-1.5 font-medium">{hasFilters ? "Đang lọc" : "Tất cả"} </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex flex-1 items-center overflow-hidden rounded-xl border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-blue-500">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder={placeholder}
                className="w-full bg-transparent py-3 pl-11 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
              {query ? (
                <button
                  onClick={onClearQuery}
                  className="absolute right-1.5 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>

            <button
              onClick={onVoiceSearch}
              className={`inline-flex items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                isListening
                  ? "border-red-300 bg-red-50 text-red-600"
                  : "border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {isListening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
            </button>

            <button
              onClick={onToggleFilters}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                showFilters
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:border-blue-400"
              }`}
            >
              <SlidersHorizontal className="size-5" />
              <span className="hidden sm:inline">Lọc</span>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
