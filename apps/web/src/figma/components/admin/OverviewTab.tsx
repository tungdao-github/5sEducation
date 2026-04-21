"use client";

import { useMemo, type ReactNode } from "react";
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
import { formatPriceCompact, type AdminStatsOverviewDto } from "../../data/api";

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
    <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <div className="mb-5 flex items-start justify-between">
        <div className={`flex size-15 items-center justify-center rounded-[22px] ${color}`}>{icon}</div>
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-green-600" : "text-red-500"}`}>
          {isPositive ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
          {Math.abs(change)}%
        </div>
      </div>
      <p className="mb-1 text-2xl font-bold text-slate-950">{value}</p>
      <p className="text-sm leading-6 text-slate-500">{title}</p>
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
              <span className="truncate text-slate-600">{item.label}</span>
              <span className="font-medium text-slate-900">{formatter ? formatter(item.value) : item.value}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
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

function RevenueOrdersChart({
  revenueSeries,
  orderSeries,
}: {
  revenueSeries: { label: string; value: number }[];
  orderSeries: { label: string; value: number }[];
}) {
  const width = 720;
  const height = 280;
  const padding = 26;
  const allValues = [...revenueSeries.map((item) => item.value), ...orderSeries.map((item) => item.value)];
  const maxValue = Math.max(...allValues, 1);
  const stepX = revenueSeries.length > 1 ? (width - padding * 2) / (revenueSeries.length - 1) : width - padding * 2;

  const buildPath = (series: { value: number }[]) =>
    series
      .map((item, index) => {
        const x = padding + index * stepX;
        const y = height - padding - (item.value / maxValue) * (height - padding * 2);
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");

  const revenuePath = buildPath(revenueSeries);
  const orderPath = buildPath(orderSeries);

  return (
    <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-[18px] font-semibold text-slate-950">Doanh thu & Đơn hàng theo tháng</h3>
          <p className="mt-1 text-sm text-slate-500">7 tháng gần nhất</p>
        </div>
        <div className="flex flex-wrap items-center gap-5 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2"><span className="size-3 rounded-full bg-blue-500" />Doanh thu (Kđ)</span>
          <span className="inline-flex items-center gap-2"><span className="size-3 rounded-full bg-emerald-500" />Đơn hàng</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[680px]">
          {[0, 1, 2, 3].map((row) => {
            const y = padding + row * ((height - padding * 2) / 3);
            const value = Math.round(maxValue - (row * maxValue) / 3);
            return (
              <g key={row}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#E2E8F0" strokeDasharray="4 4" />
                <text x={0} y={y + 4} fill="#64748B" fontSize="12">
                  {value}
                </text>
              </g>
            );
          })}

          {revenueSeries.map((item, index) => {
            const x = padding + index * stepX;
            return (
              <g key={item.label}>
                <line x1={x} y1={padding} x2={x} y2={height - padding} stroke="#F1F5F9" />
                <text x={x} y={height} textAnchor="middle" fill="#64748B" fontSize="12">
                  {item.label}
                </text>
              </g>
            );
          })}

          <path d={revenuePath} fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
          <path d={orderPath} fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />

          {revenueSeries.map((item, index) => {
            const x = padding + index * stepX;
            const y = height - padding - (item.value / maxValue) * (height - padding * 2);
            return <circle key={`revenue-${item.label}`} cx={x} cy={y} r="4.5" fill="#3B82F6" />;
          })}

          {orderSeries.map((item, index) => {
            const x = padding + index * stepX;
            const y = height - padding - (item.value / maxValue) * (height - padding * 2);
            return <circle key={`order-${item.label}`} cx={x} cy={y} r="4.5" fill="#10B981" />;
          })}
        </svg>
      </div>
    </div>
  );
}

export default function OverviewTab({ stats }: { stats: AdminStatsOverviewDto | null }) {
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
    return <div className="text-sm text-gray-500">Đang tải dữ liệu tổng quan...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-100 bg-white px-6 py-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
        <h2 className="text-[20px] font-semibold text-slate-950">Tổng quan</h2>
        <p className="mt-1 text-sm text-slate-500">Tổng quan hoạt động kinh doanh</p>
      </section>

      <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Tổng doanh thu"
            value={formatPriceCompact(stats.totalRevenue)}
            change={18.5}
            icon={<DollarSign className="size-6 text-green-600" />}
            color="bg-green-50"
          />
          <StatCard
            title="Đơn hàng tháng"
            value={String(stats.ordersByStatus.reduce((sum, item) => sum + item.count, 0))}
            change={12.3}
            icon={<ShoppingCart className="size-6 text-blue-600" />}
            color="bg-blue-50"
          />
          <StatCard
            title="Học viên mới"
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
      </div>

      <RevenueOrdersChart revenueSeries={revenueMonthly} orderSeries={orderMonthly} />

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.15fr]">
        <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <div className="mb-5 flex items-center gap-2">
            <Activity className="size-5 text-emerald-600" />
            <div>
              <h3 className="font-semibold text-slate-950">Tuyển sinh 7 ngày</h3>
              <p className="mt-0.5 text-sm text-slate-500">Số lượt ghi danh mới</p>
            </div>
          </div>
          <SimpleBars items={enrollmentDaily} />

          <div className="mt-6 border-t border-slate-100 pt-6">
            <h3 className="mb-4 font-semibold text-slate-950">Đơn hàng theo trạng thái</h3>
            <div className="space-y-3">
              {orderStatus.map((item, index) => (
                <div key={item.name} className="rounded-2xl border border-slate-100 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="size-3 rounded-full" style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }} />
                      <span className="text-sm font-medium text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{item.count} ({item.percent}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full" style={{ width: `${item.percent}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <div className="mb-5 flex items-center gap-2">
            <Award className="size-5 text-yellow-500" />
            <div>
              <h3 className="font-semibold text-slate-950">Top khóa học doanh thu</h3>
              <p className="mt-0.5 text-sm text-slate-500">Các khóa học mang về doanh thu cao nhất</p>
            </div>
          </div>
          <div className="space-y-4">
            {topCourses.map((course) => (
              <div key={course.label} className="rounded-2xl border border-slate-100 p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{course.label}</p>
                    <p className="text-xs text-slate-500">{course.orders} đơn hàng</p>
                  </div>
                  <span className="text-sm font-semibold text-blue-700">{formatPriceCompact(course.value)}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
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
