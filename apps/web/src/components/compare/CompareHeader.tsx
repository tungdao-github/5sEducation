"use client";

import { ArrowLeft, TrendingUp } from "lucide-react";
import { Link } from "@/lib/router";
import { useI18n } from "@/app/providers";

type Props = {
  selectedCount: number;
  totalCount: number;
};

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}

export default function CompareHeader({ selectedCount, totalCount }: Props) {
  const { tx } = useI18n();

  return (
    <section className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600">
          <ArrowLeft className="size-4" />
          {tx("Back", "Quay lại")}
        </Link>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <TrendingUp className="size-3.5" />
              {tx("Course comparison", "So sánh khóa học")}
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-4xl">
              {tx("Choose the best course", "Chọn khóa học phù hợp nhất")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              {tx("Compare up to 3 courses by price, duration, level and outcomes.", "So sánh tối đa 3 khóa học theo giá, thời lượng, cấp độ và kết quả học tập.")}
            </p>
          </div>
          <div className="flex gap-2">
            <StatChip label={tx("Comparing", "Đang so sánh")} value={selectedCount} />
            <StatChip label={tx("Available courses", "Khóa học khả dụng")} value={totalCount} />
          </div>
        </div>
      </div>
    </section>
  );
}
