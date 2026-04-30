"use client";

import { Plus } from "lucide-react";

type Props = {
  remaining: number;
  onOpenPicker: () => void;
};

export default function CompareAddCard({ remaining, onOpenPicker }: Props) {
  return (
    <button
      onClick={onOpenPicker}
      className="group flex min-h-[420px] items-center justify-center rounded-[28px] border-2 border-dashed border-slate-300 bg-white/70 p-6 text-slate-500 transition hover:border-blue-400 hover:bg-blue-50/60 hover:text-blue-600"
    >
      <div className="text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full border border-current bg-white">
          <Plus className="size-7" />
        </div>
        <p className="text-base font-semibold">Thêm khóa học</p>
        <p className="mt-1 text-sm">Còn {remaining} chỗ</p>
      </div>
    </button>
  );
}
