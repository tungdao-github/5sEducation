"use client";

import { useI18n } from "@/app/providers";

type Props = {
  courseTitle: string;
  completedCount: number;
  totalLessons: number;
  completionPercent: number;
};

export default function CourseSidebarHeader({ courseTitle, completedCount, totalLessons, completionPercent }: Props) {
  const { tx } = useI18n();

  return (
    <div className="border-b border-gray-700 p-4">
      <h2 className="mb-3 line-clamp-2 text-sm font-semibold text-gray-100">{courseTitle}</h2>
      <div className="mb-1.5 flex items-center justify-between text-xs text-gray-400">
        <span>
          {completedCount}/{totalLessons} {tx("lessons", "bài học")}
        </span>
        <span>{Math.round(completionPercent)}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-700">
        <div className="h-1.5 rounded-full bg-blue-500 transition-all" style={{ width: `${completionPercent}%` }} />
      </div>
    </div>
  );
}
