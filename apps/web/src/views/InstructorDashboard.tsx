"use client";

import Link from "next/link";
import { Navigate } from "@/lib/router";
import { useInstructorDashboardPage } from "@/components/instructor/useInstructorDashboardPage";
import InstructorDashboardHero from "@/components/instructor/InstructorDashboardHero";
import InstructorDashboardSidebar from "@/components/instructor/InstructorDashboardSidebar";
import InstructorOverviewPanel from "@/components/instructor/InstructorOverviewPanel";
import InstructorCoursesPanel from "@/components/instructor/InstructorCoursesPanel";
import InstructorRevenuePanel from "@/components/instructor/InstructorRevenuePanel";

export default function InstructorDashboard() {
  const { isInstructor, user, stats, courses, activeTab, setActiveTab, topCourses } = useInstructorDashboardPage();

  if (!isInstructor) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <InstructorDashboardHero userName={user?.name} stats={stats} />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <InstructorDashboardSidebar activeTab={activeTab} onSelect={setActiveTab} />

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{activeTab === "overview" ? "Tổng quan" : activeTab === "courses" ? "Khóa học của tôi" : "Doanh thu"}</h2>
                  <p className="mt-1 text-slate-500">
                    {activeTab === "overview" ? "Tổng quan hoạt động giảng dạy" : activeTab === "courses" ? `${courses.length} khóa học đang hoạt động` : "Theo dõi thu nhập từ các khóa học"}
                  </p>
                </div>
                <Link
                  href="/instructor/create-course"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  Tạo khóa học
                </Link>
              </div>
            </div>

            {activeTab === "overview" ? <InstructorOverviewPanel stats={stats} topCourses={topCourses} /> : null}
            {activeTab === "courses" ? <InstructorCoursesPanel courses={courses} /> : null}
            {activeTab === "revenue" ? (
              <InstructorRevenuePanel thisMonthRevenue={stats.thisMonthRevenue} lastMonthRevenue={stats.lastMonthRevenue} revenueGrowth={stats.revenueGrowth} />
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
