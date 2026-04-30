"use client";

import { BookOpen } from "lucide-react";
import { useI18n } from "@/app/providers";

type Props = {
  onOpenPicker: () => void;
};

export default function CompareEmptyState({ onOpenPicker }: Props) {
  const { tx } = useI18n();

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
      <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <BookOpen className="size-8" />
      </div>
      <h2 className="text-2xl font-semibold tracking-[-0.02em] text-slate-950">{tx("Choose courses to compare", "Chọn khóa học để so sánh")}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
        {tx("Add 2 to 3 courses to compare price, rating, duration and curriculum side by side.", "Thêm từ 2 đến 3 khóa học để xem mức giá, đánh giá, thời lượng, cấp độ và nội dung học song song.")}
      </p>
      <button
        onClick={onOpenPicker}
        className="mt-6 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        {tx("Open course list", "Mở danh sách khóa học")}
      </button>
    </div>
  );
}
