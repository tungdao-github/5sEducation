"use client";

import { type ElementType } from "react";
import { Award, BookOpen, Plus, TrendingUp } from "lucide-react";
import Link from "next/link";
import { formatPriceCompact } from "@/services/api";
import { useI18n } from "@/app/providers";

type StatItem = {
  label: string;
  value: string | number;
  sub: string;
  icon: ElementType;
  color: string;
};

type Props = {
  userName?: string;
  stats: {
    totalCourses: number;
    publishedCourses: number;
    draftCourses: number;
    totalStudents: number;
    totalRevenue: number;
    revenueGrowth: number;
    avgRating: number;
  };
};

export default function InstructorDashboardHero({ userName, stats }: Props) {
  const { tx } = useI18n();

  const items: StatItem[] = [
    {
      label: tx("Total courses", "Tổng khóa học"),
      value: stats.totalCourses,
      sub: tx(`${stats.publishedCourses} published • ${stats.draftCourses} drafts`, `${stats.publishedCourses} đã xuất bản • ${stats.draftCourses} nháp`),
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: tx("Total students", "Tổng học viên"),
      value: stats.totalStudents.toLocaleString(),
      sub: tx("Students are taking your courses", "Học viên đang theo học các khóa của bạn"),
      icon: Award,
      color: "from-emerald-500 to-teal-500",
    },
    {
      label: tx("Revenue", "Doanh thu"),
      value: formatPriceCompact(stats.totalRevenue),
      sub:
        stats.revenueGrowth >= 0
          ? tx(`+${stats.revenueGrowth.toFixed(1)}% vs last month`, `+${stats.revenueGrowth.toFixed(1)}% so với tháng trước`)
          : tx(`${stats.revenueGrowth.toFixed(1)}% vs last month`, `${stats.revenueGrowth.toFixed(1)}% so với tháng trước`),
      icon: TrendingUp,
      color: "from-purple-500 to-fuchsia-500",
    },
    {
      label: tx("Avg rating", "Đánh giá TB"),
      value: stats.avgRating.toFixed(1),
      sub: tx("Average score from learner feedback", "Điểm trung bình từ phản hồi học viên"),
      icon: Award,
      color: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <section className="border-b border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-300">{tx("Instructor dashboard", "Bảng điều khiển giảng viên")}</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{tx("Instructor dashboard", "Bảng điều khiển giảng viên")}</h1>
            <p className="mt-2 text-slate-300">
              {tx("Hello,", "Xin chào,")} <span className="font-semibold text-white">{userName}</span>. {tx("Manage your courses and track your performance.", "Quản lý khóa học và theo dõi hiệu suất của bạn.")}
            </p>
          </div>

          <Link
            href="/instructor/create-course"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg transition-colors hover:bg-slate-100"
          >
            <Plus className="size-4" />
            {tx("Create new course", "Tạo khóa học mới")}
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((stat) => {
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
  );
}
