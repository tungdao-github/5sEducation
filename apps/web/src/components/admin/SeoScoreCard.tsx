"use client";

import { useI18n } from "@/app/providers";

type Props = {
  score: number;
  pagesCount: number;
};

export default function SeoScoreCard({ score, pagesCount }: Props) {
  const { tx } = useI18n();

  return (
    <div className="mb-6 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900">{tx("Overall SEO score", "Điểm SEO tổng thể")}</p>
          <p className="mt-0.5 text-sm text-gray-500">
            {tx("Based on", "Dựa trên")} {pagesCount} {tx("main pages", "trang chính")}
          </p>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600">{score}</div>
          <div className="text-xs text-gray-500">/100</div>
        </div>
      </div>
    </div>
  );
}
