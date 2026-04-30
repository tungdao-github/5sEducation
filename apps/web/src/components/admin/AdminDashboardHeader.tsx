"use client";

import { BookOpen, Package, Shield, Users } from "lucide-react";
import { useI18n } from "@/app/providers";
import { Link } from "@/lib/router";

type Props = {
  userName?: string;
  totalRevenue: string;
  ordersCount: number;
  totalUsers: number;
  totalCourses: number;
};

export default function AdminDashboardHeader({ userName, totalRevenue, ordersCount, totalUsers, totalCourses }: Props) {
  const { tx } = useI18n();
  const cards = [
    { label: tx("Revenue", "Doanh thu"), value: totalRevenue, icon: <Shield className="size-4" /> },
    { label: tx("Orders", "Đơn hàng"), value: ordersCount, icon: <Package className="size-4" /> },
    { label: tx("Students", "Học viên"), value: totalUsers, icon: <Users className="size-4" /> },
    { label: tx("Courses", "Khóa học"), value: totalCourses, icon: <BookOpen className="size-4" /> },
  ];

  return (
    <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white">
      <div className="mx-auto max-w-screen-2xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="text-white/80 hover:text-white lg:hidden">
              <Shield className="size-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold">{tx("Admin Dashboard", "Bảng điều khiển quản trị")}</h1>
              <p className="text-sm text-indigo-200">
                {tx("Welcome, ", "Chào mừng, ")}
                {userName ?? "Admin"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden grid-cols-4 gap-3 sm:grid">
              {cards.map((card) => (
                <div key={card.label} className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-white/10 px-3 py-2">
                  <div className="text-white/70">{card.icon}</div>
                  <div>
                    <div className="text-sm font-bold">{card.value}</div>
                    <div className="text-xs text-white/60">{card.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/" className="hidden text-sm text-white/80 underline underline-offset-2 hover:text-white sm:block">
              {tx("← Back to home", "← Về trang chủ")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
