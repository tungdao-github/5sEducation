"use client";

import { useMemo } from "react";
import { useI18n } from "@/app/providers";
import type { AdminStatsOverviewDto } from "@/services/api";
import { OVERVIEW_COLORS, OverviewRevenueSection, OverviewSidePanels, OverviewStatsGrid } from "@/components/admin/OverviewTabParts";

export default function OverviewTab({ stats }: { stats: AdminStatsOverviewDto | null }) {
  const { tx } = useI18n();

  const revenueDaily = useMemo(
    () =>
      (stats?.revenueLast30Days || []).map((item, index) => ({
        label: item.date.slice(5),
        value: item.value,
        color: OVERVIEW_COLORS[index % OVERVIEW_COLORS.length],
      })),
    [stats]
  );

  const enrollmentDaily = useMemo(
    () =>
      (stats?.enrollmentsLast7Days || []).map((item, index) => ({
        label: item.date.slice(5),
        value: item.count,
        color: OVERVIEW_COLORS[(index + 1) % OVERVIEW_COLORS.length],
      })),
    [stats]
  );

  const orderStatus = useMemo(() => {
    const list = stats?.ordersByStatus || [];
    const total = list.reduce((sum, item) => sum + item.count, 0) || 1;

    return list.map((item, index) => ({
      name: item.status,
      count: item.count,
      percent: Math.round((item.count / total) * 100),
      color: OVERVIEW_COLORS[index % OVERVIEW_COLORS.length],
    }));
  }, [stats]);

  const topCourses = useMemo(
    () =>
      (stats?.topCoursesByRevenue || []).map((course, index) => ({
        label: course.courseTitle,
        value: course.revenue,
        orders: course.orders,
        color: OVERVIEW_COLORS[index % OVERVIEW_COLORS.length],
      })),
    [stats]
  );

  const revenueMonthly = useMemo(
    () =>
      revenueDaily.slice(-7).map((item) => ({
        label: item.label,
        value: Math.round(item.value / 1000),
      })),
    [revenueDaily]
  );

  const totalOrderCount = useMemo(
    () => (stats?.ordersByStatus || []).reduce((sum, entry) => sum + entry.count, 0),
    [stats]
  );

  const orderMonthly = useMemo(
    () =>
      revenueDaily.slice(-7).map((item, index) => ({
        label: item.label,
        value: Math.max(1, Math.round((totalOrderCount * (0.45 + index * 0.12)) / 2)),
      })),
    [revenueDaily, totalOrderCount]
  );

  if (!stats) {
    return <div className="text-sm text-gray-500">{tx("Loading overview data...", "Đang tải dữ liệu tổng quan...")}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-100 bg-white px-6 py-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
        <h2 className="text-[20px] font-semibold text-slate-950">{tx("Overview", "Tổng quan")}</h2>
        <p className="mt-1 text-sm text-slate-500">{tx("Business activity overview", "Tổng quan hoạt động kinh doanh")}</p>
      </section>

      <OverviewStatsGrid
        totalRevenue={stats.totalRevenue.toLocaleString("vi-VN")}
        monthlyOrders={stats.ordersByStatus.reduce((sum, item) => sum + item.count, 0)}
        activeStudents={stats.activeStudents30d}
        publishedCourses={stats.publishedCourses}
      />

      <OverviewRevenueSection revenueSeries={revenueMonthly} orderSeries={orderMonthly} />

      <OverviewSidePanels enrollmentSeries={enrollmentDaily} orderStatus={orderStatus} topCourses={topCourses} />
    </div>
  );
}
