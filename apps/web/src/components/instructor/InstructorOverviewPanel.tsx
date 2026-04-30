"use client";

import { BookOpen, Star, Users, DollarSign, AlertCircle, TrendingUp } from "lucide-react";
import Link from "next/link";
import { formatPriceCompact } from "@/services/api";
import { statusMeta } from "@/components/instructor/instructorDashboardUtils";

type Props = {
  stats: {
    totalCourses: number;
    publishedCourses: number;
    draftCourses: number;
    totalStudents: number;
    totalRevenue: number;
    revenueGrowth: number;
    avgRating: number;
    pendingCourses: number;
  };
  topCourses: Array<{
    id: number | string;
    numericId: number;
    title: string;
    thumbnail?: string | null;
    lessons: number;
    students: number;
    rating: number;
    status: string;
  }>;
};

export default function InstructorOverviewPanel({ stats, topCourses }: Props) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {stats.pendingCourses > 0 ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 text-amber-600" />
              <div>
                <h3 className="font-semibold text-amber-900">
                  Bạn có {stats.pendingCourses} khóa học đang chờ phê duyệt
                </h3>
                <p className="mt-1 text-sm text-amber-700">Chúng tôi sẽ xem xét trong 3-5 ngày làm việc.</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Khóa học gần đây</h3>
              <p className="mt-1 text-sm text-slate-500">Các khóa học bạn đang làm việc</p>
            </div>
          </div>

          {topCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 py-14 text-center">
              <BookOpen className="size-12 text-slate-300" />
              <h4 className="mt-4 text-lg font-semibold text-slate-800">Chưa có khóa học nào</h4>
              <p className="mt-2 text-sm text-slate-500">Bắt đầu tạo khóa học đầu tiên của bạn</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topCourses.map((course) => {
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
                          <span className="flex items-center gap-1">
                            <Star className="size-3.5 fill-amber-400 text-amber-400" />
                            {course.rating > 0 ? course.rating.toFixed(1) : "Chưa có"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/studio/${course.numericId}`}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      Quản lý
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Gợi ý cải thiện</h3>
          <p className="mt-1 text-sm text-slate-500">Tối ưu hóa khóa học của bạn</p>
          <div className="mt-5 space-y-3">
            {[
              {
                title: "Thêm video giới thiệu",
                desc: "Khóa học có video giới thiệu thu hút nhiều học viên hơn.",
              },
              {
                title: "Hoàn thiện mô tả",
                desc: "Mô tả rõ ràng giúp học viên hiểu giá trị khóa học.",
              },
              {
                title: "Cập nhật nội dung",
                desc: "Giữ nội dung luôn mới để tăng tỷ lệ chuyển đổi.",
              },
            ].map((tip) => (
              <div key={tip.title} className="rounded-2xl border border-slate-200 p-4">
                <p className="font-semibold text-slate-900">{tip.title}</p>
                <p className="mt-1 text-sm text-slate-500">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
