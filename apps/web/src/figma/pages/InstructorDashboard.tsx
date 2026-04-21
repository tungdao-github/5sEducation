"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Navigate } from "@/figma/compat/router";
import { useAuth } from "../contexts/AuthContext";
import { useInstructor } from "../contexts/InstructorContext";
import { formatPriceCompact } from "../data/api";
import {
  AlertCircle,
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Plus,
  Star,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

const statusMeta: Record<string, { label: string; className: string; icon: ReactNode }> = {
  published: { label: "Đã xuất bản", className: "bg-emerald-100 text-emerald-700", icon: <CheckCircle className="size-3" /> },
  pending: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700", icon: <Clock className="size-3" /> },
  draft: { label: "Nháp", className: "bg-slate-100 text-slate-700", icon: <FileText className="size-3" /> },
  rejected: { label: "Từ chối", className: "bg-rose-100 text-rose-700", icon: <XCircle className="size-3" /> },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function InstructorDashboard() {
  const { isInstructor, user } = useAuth();
  const { stats, courses } = useInstructor();
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "revenue">("overview");

  const topCourses = useMemo(() => [...courses].slice(0, 5), [courses]);

  if (!isInstructor) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-300">Instructor Dashboard</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Bảng điều khiển giảng viên</h1>
              <p className="mt-2 text-slate-300">
                Xin chào, <span className="font-semibold text-white">{user?.name}</span>. Quản lý khóa học và theo dõi hiệu suất của bạn.
              </p>
            </div>

            <Link
              href="/instructor/create-course"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg transition-colors hover:bg-slate-100"
            >
              <Plus className="size-4" />
              Tạo khóa học mới
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Tổng khóa học",
                value: stats.totalCourses,
                sub: `${stats.publishedCourses} đã xuất bản • ${stats.draftCourses} nháp`,
                icon: BookOpen,
                color: "from-blue-500 to-cyan-500",
              },
              {
                label: "Tổng học viên",
                value: stats.totalStudents.toLocaleString(),
                sub: "Học viên đang theo học các khóa của bạn",
                icon: Users,
                color: "from-emerald-500 to-teal-500",
              },
              {
                label: "Doanh thu",
                value: formatPriceCompact(stats.totalRevenue),
                sub: stats.revenueGrowth >= 0 ? `+${stats.revenueGrowth.toFixed(1)}% so với tháng trước` : `${stats.revenueGrowth.toFixed(1)}% so với tháng trước`,
                icon: DollarSign,
                color: "from-purple-500 to-fuchsia-500",
              },
              {
                label: "Đánh giá TB",
                value: stats.avgRating.toFixed(1),
                sub: "Điểm trung bình từ phản hồi học viên",
                icon: Star,
                color: "from-amber-500 to-orange-500",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-300">{stat.label}</p>
                      <div className="mt-2 text-3xl font-black tracking-tight text-white">{stat.value}</div>
                      <p className="mt-1 text-xs leading-5 text-slate-300">{stat.sub}</p>
                    </div>
                    <div className={`flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                      <Icon className="size-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Quản lý</p>
            </div>
            <div className="space-y-1">
              {[
                { id: "overview", label: "Tổng quan", icon: Award },
                { id: "courses", label: "Khóa học của tôi", icon: BookOpen },
                { id: "revenue", label: "Doanh thu", icon: TrendingUp },
              ].map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id as typeof activeTab)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                      active ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {activeTab === "overview" ? "Tổng quan" : activeTab === "courses" ? "Khóa học của tôi" : "Doanh thu"}
                  </h2>
                  <p className="mt-1 text-slate-500">
                    {activeTab === "overview"
                      ? "Tổng quan hoạt động giảng dạy"
                      : activeTab === "courses"
                        ? `${courses.length} khóa học đang hoạt động`
                        : "Theo dõi thu nhập từ các khóa học"}
                  </p>
                </div>
                <Link
                  href="/instructor/create-course"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  <Plus className="size-4" />
                  Tạo khóa học
                </Link>
              </div>
            </div>

            {activeTab === "overview" && (
              <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                <div className="space-y-6">
                  {stats.pendingCourses > 0 && (
                    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 size-5 text-amber-600" />
                        <div>
                          <h3 className="font-semibold text-amber-900">Bạn có {stats.pendingCourses} khóa học đang chờ phê duyệt</h3>
                          <p className="mt-1 text-sm text-amber-700">Chúng tôi sẽ xem xét trong 3-5 ngày làm việc.</p>
                        </div>
                      </div>
                    </div>
                  )}

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
                            <div key={course.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 transition-colors hover:border-blue-200 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
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
                              <Link href={`/studio/${course.numericId}`} className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
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
                          tone: "blue",
                        },
                        {
                          title: "Cập nhật nội dung định kỳ",
                          desc: "Nội dung cập nhật thường xuyên thường có đánh giá tốt hơn.",
                          tone: "emerald",
                        },
                        {
                          title: "Tương tác với học viên",
                          desc: "Phản hồi câu hỏi giúp tăng sự hài lòng của học viên.",
                          tone: "purple",
                        },
                      ].map((tip) => (
                        <div key={tip.title} className={`rounded-2xl border p-4 ${tip.tone === "blue" ? "border-blue-100 bg-blue-50" : tip.tone === "emerald" ? "border-emerald-100 bg-emerald-50" : "border-purple-100 bg-purple-50"}`}>
                          <div className="flex items-start gap-3">
                            <CheckCircle className={`mt-0.5 size-5 ${tip.tone === "blue" ? "text-blue-600" : tip.tone === "emerald" ? "text-emerald-600" : "text-purple-600"}`} />
                            <div>
                              <h4 className={`font-medium ${tip.tone === "blue" ? "text-blue-900" : tip.tone === "emerald" ? "text-emerald-900" : "text-purple-900"}`}>{tip.title}</h4>
                              <p className={`mt-1 text-sm ${tip.tone === "blue" ? "text-blue-700" : tip.tone === "emerald" ? "text-emerald-700" : "text-purple-700"}`}>{tip.desc}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900">Thống kê nhanh</h3>
                      <TrendingUp className="size-5 text-emerald-600" />
                    </div>
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                        <span className="text-slate-500">Tổng doanh thu</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(stats.totalRevenue)}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                        <span className="text-slate-500">Học viên trung bình</span>
                        <span className="font-semibold text-slate-900">
                          {stats.totalCourses > 0 ? Math.round(stats.totalStudents / stats.totalCourses) : 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                        <span className="text-slate-500">Đánh giá trung bình</span>
                        <span className="font-semibold text-slate-900">{stats.avgRating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "courses" && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Khóa học của tôi</h3>
                    <p className="mt-1 text-sm text-slate-500">Các khóa học bạn đã tạo</p>
                  </div>
                  <Link href="/instructor/create-course" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
                    <Plus className="size-4" />
                    Tạo mới
                  </Link>
                </div>
                <div className="space-y-4">
                  {courses.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 py-14 text-center text-slate-500">
                      Chưa có khóa học nào.
                    </div>
                  ) : (
                    courses.map((course) => {
                      const meta = statusMeta[course.status] ?? statusMeta.draft;
                      return (
                        <div key={course.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
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
                              <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                                <span>{course.category}</span>
                                <span>{course.lessons} bài học</span>
                                <span>{course.students.toLocaleString()} học viên</span>
                                <span>{formatPriceCompact(course.revenue)}</span>
                              </div>
                            </div>
                          </div>
                          <Link href={`/studio/${course.numericId}`} className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                            Quản lý
                          </Link>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {activeTab === "revenue" && (
              <div className="grid gap-6 lg:grid-cols-3">
                {[
                  { label: "Tháng này", value: formatCurrency(stats.thisMonthRevenue), color: "blue" },
                  { label: "Tháng trước", value: formatCurrency(stats.lastMonthRevenue), color: "slate" },
                  { label: "Tổng cộng", value: formatCurrency(stats.totalRevenue), color: "emerald" },
                ].map((item) => (
                  <div key={item.label} className={`rounded-3xl border p-6 shadow-sm ${item.color === "blue" ? "border-blue-100 bg-blue-50" : item.color === "emerald" ? "border-emerald-100 bg-emerald-50" : "border-slate-200 bg-white"}`}>
                    <p className={`text-sm ${item.color === "blue" ? "text-blue-600" : item.color === "emerald" ? "text-emerald-600" : "text-slate-500"}`}>{item.label}</p>
                    <div className={`mt-2 text-3xl font-black ${item.color === "blue" ? "text-blue-900" : item.color === "emerald" ? "text-emerald-900" : "text-slate-900"}`}>{item.value}</div>
                  </div>
                ))}
                <div className="lg:col-span-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900">Biểu đồ doanh thu</h3>
                  <p className="mt-1 text-sm text-slate-500">Chi tiết theo tháng đang được đồng bộ từ backend.</p>
                  <div className="mt-6 rounded-3xl bg-slate-50 p-8 text-center text-slate-500">
                    Biểu đồ chi tiết đang ở mức dữ liệu nền tảng.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
