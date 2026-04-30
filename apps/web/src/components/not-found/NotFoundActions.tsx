"use client";

import { ArrowLeft, Home, Search } from "lucide-react";

type Props = {
  onBack: () => void;
  onHome: () => void;
  onSearch: () => void;
};

export default function NotFoundActions({ onBack, onHome, onSearch }: Props) {
  return (
    <div className="mb-16 flex flex-wrap items-center justify-center gap-4">
      <button onClick={onBack} className="flex items-center gap-2 rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-300">
        <ArrowLeft className="size-5" />
        Quay lại
      </button>
      <button onClick={onHome} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700">
        <Home className="size-5" />
        Về trang chủ
      </button>
      <button onClick={onSearch} className="flex items-center gap-2 rounded-lg border-2 border-indigo-600 px-6 py-3 font-medium text-indigo-600 transition-colors hover:bg-indigo-50">
        <Search className="size-5" />
        Tìm khóa học
      </button>
    </div>
  );
}
