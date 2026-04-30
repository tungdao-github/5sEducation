"use client";

import { formatCurrency } from "@/components/instructor/instructorDashboardUtils";

type Props = {
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  revenueGrowth: number;
};

export default function InstructorRevenuePanel({ thisMonthRevenue, lastMonthRevenue, revenueGrowth }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Doanh thu</h3>
        <p className="mt-1 text-sm text-slate-500">Thu nhập từ các khóa học của bạn</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Tháng này</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(thisMonthRevenue)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Tháng trước</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(lastMonthRevenue)}</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Tăng trưởng</h3>
        <p className="mt-1 text-sm text-slate-500">{revenueGrowth >= 0 ? "Đang tăng trưởng" : "Cần tối ưu thêm"}</p>
        <div className="mt-6 rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Tỷ lệ tăng trưởng</p>
          <p className="mt-2 text-3xl font-black text-slate-900">
            {revenueGrowth >= 0 ? "+" : ""}
            {revenueGrowth.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}
