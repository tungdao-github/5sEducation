"use client";

import { BookOpen, Check, Clock, Star, Users } from "lucide-react";
import { formatPrice } from "@/services/api";
import type { Course } from "@/contexts/CartContext";
import type { ReactNode } from "react";

type Props = {
  selectedCourses: Course[];
};

const rows: { label: string; key: keyof Course; render?: (value: unknown) => ReactNode }[] = [
  { label: "Giá", key: "price", render: (value) => <span className="font-semibold text-blue-600">{formatPrice(Number(value))}</span> },
  { label: "Giá gốc", key: "originalPrice", render: (value) => (value ? <span className="text-slate-400 line-through">{formatPrice(Number(value))}</span> : "—") },
  { label: "Đánh giá", key: "rating", render: (value) => <span className="inline-flex items-center gap-1"><Star className="size-4 fill-amber-400 text-amber-400" />{String(value)}/5</span> },
  { label: "Học viên", key: "students", render: (value) => <span className="inline-flex items-center gap-1"><Users className="size-4 text-slate-400" />{Number(value).toLocaleString()}</span> },
  { label: "Thời lượng", key: "duration", render: (value) => <span className="inline-flex items-center gap-1"><Clock className="size-4 text-slate-400" />{String(value)}</span> },
  { label: "Số bài học", key: "lessons", render: (value) => <span className="inline-flex items-center gap-1"><BookOpen className="size-4 text-slate-400" />{Number(value)} bài</span> },
  { label: "Cấp độ", key: "level", render: (value) => <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{String(value)}</span> },
  { label: "Danh mục", key: "category" },
  { label: "Giảng viên", key: "instructor" },
];

export default function CompareTable({ selectedCourses }: Props) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-950">So sánh chi tiết</h2>
        <p className="text-sm text-slate-500">Các tiêu chí chính để ra quyết định nhanh hơn.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse">
          <tbody>
            {rows.map((row, index) => (
              <tr key={String(row.key)} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/70"}>
                <td className="w-48 px-5 py-4 text-sm font-semibold text-slate-700">{row.label}</td>
                {selectedCourses.map((course) => (
                  <td key={course.id} className="px-5 py-4 text-center text-sm text-slate-700">
                    {row.render ? row.render(course[row.key]) : String(course[row.key])}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="bg-white">
              <td className="px-5 py-4 text-sm font-semibold text-slate-700">Bạn sẽ học được</td>
              {selectedCourses.map((course) => (
                <td key={course.id} className="px-5 py-4 align-top">
                  {course.learningOutcomes.length > 0 ? (
                    <ul className="space-y-2 text-left text-sm text-slate-600">
                      {course.learningOutcomes.map((outcome, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-400">Đang cập nhật</p>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
