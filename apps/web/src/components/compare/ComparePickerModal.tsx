"use client";

import { X } from "lucide-react";
import { formatPrice } from "@/services/api";
import { useI18n } from "@/app/providers";
import type { Course } from "@/contexts/CartContext";

type Props = {
  open: boolean;
  courses: Course[];
  maxCompare: number;
  onClose: () => void;
  onPick: (course: Course) => void;
};

export default function ComparePickerModal({ open, courses, maxCompare, onClose, onPick }: Props) {
  const { tx } = useI18n();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-slate-950/60" onClick={onClose} aria-label={tx("Close", "Đóng")} />
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.28)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">{tx("Choose courses to compare", "Chọn khóa học để so sánh")}</h3>
            <p className="text-sm text-slate-500">
              {tx("Select up to", "Chỉ chọn tối đa")} {maxCompare} {tx("courses", "khóa học")}.
            </p>
          </div>
          <button onClick={onClose} className="inline-flex size-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950">
            <X className="size-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => onPick(course)}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 p-3 text-left transition hover:border-blue-300 hover:bg-blue-50/60"
              >
                <img src={course.image} alt={course.title} className="h-14 w-20 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold text-slate-950">{course.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{course.instructor}</p>
                  <p className="mt-1 text-xs font-semibold text-blue-600">{formatPrice(course.price)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
