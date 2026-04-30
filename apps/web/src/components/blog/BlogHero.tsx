"use client";

import { Search } from "lucide-react";
import { useI18n } from "@/app/providers";

type Props = {
  title: string;
  search: string;
  onSearchChange: (value: string) => void;
};

export default function BlogHero({ title, search, onSearchChange }: Props) {
  const { tx } = useI18n();

  return (
    <div className="bg-[linear-gradient(135deg,#081221_0%,#1d4ed8_50%,#4f46e5_100%)] py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="mb-4 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">{title}</h1>
        <p className="mb-8 text-slate-200">{tx("UX/UI knowledge, design trends and user research", "Kiến thức UX/UI Design, xu hướng thiết kế và nghiên cứu người dùng")}</p>
        <div className="relative mx-auto max-w-xl">
          <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={tx("Search articles...", "Tìm kiếm bài viết...")}
            className="w-full rounded-full py-3 pl-11 pr-4 text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.14)] focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
