"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { statusMeta } from "@/components/instructor/instructorDashboardUtils";

type Props = {
  courses: Array<{
    id: number | string;
    numericId: number;
    title: string;
    thumbnail?: string | null;
    lessons: number;
    students: number;
    category: string;
    level: string;
    status: string;
  }>;
};

export default function InstructorCoursesPanel({ courses }: Props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-4">
        {courses.map((course) => {
          const meta = statusMeta[course.status] ?? statusMeta.draft;
          return (
            <div
              key={course.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 transition-colors hover:border-blue-200 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-4">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="h-16 w-24 shrink-0 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                    <BookOpen className="size-6" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="truncate text-sm font-semibold text-slate-900">{course.title}</h4>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.className}`}>
                      {meta.icon}
                      {meta.label}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>{course.lessons} bài học</span>
                    <span>{course.students.toLocaleString()} học viên</span>
                    <span>{course.category}</span>
                    <span>{course.level}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/studio/${course.numericId}`}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  Chỉnh sửa
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
