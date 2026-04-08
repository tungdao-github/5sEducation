"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  BookOpen,
  ShoppingCart,
  Award,
  Activity,
} from "lucide-react";
import { fetchAdminStatsOverview, formatPriceCompact, type AdminStatsOverviewDto } from "../../data/api";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

type StatCardProps = {
  title: string;
  value: string;
  change: number;
  icon: ReactNode;
  color: string;
};

function StatCard({ title, value, change, icon, color }: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div className={`flex size-12 items-center justify-center rounded-xl ${color}`}>{icon}</div>
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-green-600" : "text-red-500"}`}>
          {isPositive ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
          {Math.abs(change)}%
        </div>
      </div>
      <p className="mb-1 text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  );
}

function SimpleBars({ items, formatter }: { items: { label: string; value: number; color?: string }[]; formatter?: (value: number) => string }) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const width = Math.max((item.value / max) * 100, 4);
        return (
          <div key={`${item.label}-${index}`}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="truncate text-gray-600">{item.label}</span>
              <span className="font-medium text-gray-900">{formatter ? formatter(item.value) : item.value}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full"
                style={{ width: `${width}%`, backgroundColor: item.color || COLORS[index % COLORS.length] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function OverviewTab() {
  const [stats, setStats] = useState<AdminStatsOverviewDto | null>(null);

  useEffect(() => {
    let active = true;

    fetchAdminStatsOverview()
      .then((data) => {
        if (active) setStats(data);
      })
      .catch(() => {
        if (active) setStats(null);
      });

    return () => {
      active = false;
    };
  }, []);

  const revenueDaily = useMemo(
    () =>
      (stats?.revenueLast30Days || []).map((item, index) => ({
        label: item.date.slice(5),
        value: item.value,
        color: COLORS[index % COLORS.length],
      })),
    [stats]
  );

  const enrollmentDaily = useMemo(
    () =>
      (stats?.enrollmentsLast7Days || []).map((item, index) => ({
        label: item.date.slice(5),
        value: item.count,
        color: COLORS[(index + 1) % COLORS.length],
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
      color: COLORS[index % COLORS.length],
    }));
  }, [stats]);

  const topCourses = useMemo(
    () =>
      (stats?.topCoursesByRevenue || []).map((course, index) => ({
        label: course.courseTitle,
        value: course.revenue,
        orders: course.orders,
        color: COLORS[index % COLORS.length],
      })),
    [stats]
  );

  if (!stats) {
    return <div className="text-sm text-gray-500">Đang tải dữ liệu tổng quan...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Tổng doanh thu"
          value={formatPriceCompact(stats.totalRevenue)}
          change={18.5}
          icon={<DollarSign className="size-6 text-green-600" />}
          color="bg-green-50"
        />
        <StatCard
          title="Đơn hàng"
          value={String(stats.ordersByStatus.reduce((sum, item) => sum + item.count, 0))}
          change={12.3}
          icon={<ShoppingCart className="size-6 text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard
          title="Học viên mới (30 ngày)"
          value={String(stats.activeStudents30d)}
          change={28.7}
          icon={<Users className="size-6 text-purple-600" />}
          color="bg-purple-50"
        />
        <StatCard
          title="Khóa học hoạt động"
          value={String(stats.publishedCourses)}
          change={0}
          icon={<BookOpen className="size-6 text-orange-600" />}
          color="bg-orange-50"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <DollarSign className="size-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Doanh thu 30 ngày gần nhất</h3>
              <p className="mt-0.5 text-sm text-gray-500">Dữ liệu theo ngày</p>
            </div>
          </div>
          <SimpleBars items={revenueDaily.slice(-8)} formatter={(value) => formatPriceCompact(value)} />
        </section>

        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Activity className="size-5 text-emerald-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Tuyển sinh 7 ngày</h3>
              <p className="mt-0.5 text-sm text-gray-500">Số lượt ghi danh mới</p>
            </div>
          </div>
          <SimpleBars items={enrollmentDaily} />
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1.4fr]">
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-5 font-semibold text-gray-900">Đơn hàng theo trạng thái</h3>
          <div className="space-y-3">
            {orderStatus.map((item, index) => (
              <div key={item.name} className="rounded-xl border border-gray-100 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full" style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }} />
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{item.count} ({item.percent}%)</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div className="h-2 rounded-full" style={{ width: `${item.percent}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Award className="size-5 text-yellow-500" />
            <h3 className="font-semibold text-gray-900">Top khóa học doanh thu</h3>
          </div>
          <div className="space-y-4">
            {topCourses.map((course) => (
              <div key={course.label} className="rounded-xl border border-gray-100 p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-900">{course.label}</p>
                    <p className="text-xs text-gray-500">{course.orders} đơn hàng</p>
                  </div>
                  <span className="text-sm font-semibold text-blue-700">{formatPriceCompact(course.value)}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div className="h-2 rounded-full" style={{ width: `${Math.max((course.value / Math.max(...topCourses.map((item) => item.value), 1)) * 100, 6)}%`, backgroundColor: course.color }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
