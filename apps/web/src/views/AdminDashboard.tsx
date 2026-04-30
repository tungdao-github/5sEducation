"use client";

import { useMemo } from "react";
import { useI18n } from "@/app/providers";
import { Navigate } from "@/lib/router";
import AdminDashboardHeader from "@/components/admin/AdminDashboardHeader";
import AdminDashboardSidebar from "@/components/admin/AdminDashboardSidebar";
import ActivityLogsTab from "@/components/admin/ActivityLogsTab";
import BlogTab from "@/components/admin/BlogTab";
import CategoriesTab from "@/components/admin/CategoriesTab";
import CouponsTab from "@/components/admin/CouponsTab";
import InstructorsTab from "@/components/admin/InstructorsTab";
import OverviewTab from "@/components/admin/OverviewTab";
import SEOTab from "@/components/admin/SEOTab";
import SystemConfigTab from "@/components/admin/SystemConfigTab";
import AdminCoursesTab from "@/components/admin/CoursesTab";
import AdminOrdersTab from "@/components/admin/OrdersTab";
import AdminUsersTab from "@/components/admin/UsersTab";
import { formatPriceCompact } from "@/services/api";
import { useAdminDashboard } from "@/components/admin/useAdminDashboard";
import { buildAdminDashboardTabs, buildAdminTabDescriptions } from "@/components/admin/adminDashboardTabs";
import type { AdminTab } from "@/components/admin/adminDashboardTypes";

export default function AdminDashboard({ initialTab = "overview" }: { initialTab?: AdminTab }) {
  const { tx } = useI18n();
  const {
    user,
    isAdmin,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    courses,
    orders,
    users,
    loading,
    totalRevenue,
    totalUsers,
    totalCourses,
    overviewStats,
    handleExportOrders,
    handleExportCourses,
    changeOrderStatus,
    changeUserRole,
    toggleUserLock,
    changeInstructorRole,
    removeCourse,
    TAB_ROUTES,
  } = useAdminDashboard(initialTab);

  const tabs = useMemo(() => buildAdminDashboardTabs({ courses: courses.length, orders: orders.length, users: users.length }, tx), [courses.length, orders.length, users.length, tx]);
  const tabDescriptions = useMemo(() => buildAdminTabDescriptions(tx), [tx]);

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <AdminDashboardHeader
        userName={user?.name}
        totalRevenue={formatPriceCompact(totalRevenue)}
        ordersCount={orders.length}
        totalUsers={totalUsers}
        totalCourses={totalCourses}
      />

      <div className="mx-auto flex w-full max-w-screen-2xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <AdminDashboardSidebar tabs={tabs} activeTab={activeTab} routes={TAB_ROUTES} />

        <main className="min-w-0 flex-1">
          <div className="mb-5 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{tabs.find((tab) => tab.id === activeTab)?.label}</h2>
                <p className="mt-0.5 text-sm text-gray-500">{tabDescriptions[activeTab]}</p>
              </div>
              <div className="flex items-center gap-2">
                {activeTab === "orders" ? (
                  <button
                    onClick={handleExportOrders}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50"
                  >
                    {tx("Export CSV", "Xuất CSV")}
                  </button>
                ) : null}
                {activeTab === "courses" ? (
                  <button
                    onClick={handleExportCourses}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50"
                  >
                    {tx("Export CSV", "Xuất CSV")}
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            {loading ? <div className="text-sm text-slate-500">{tx("Loading data...", "Đang tải dữ liệu...")}</div> : null}
            {!loading && activeTab === "overview" ? <OverviewTab stats={overviewStats} /> : null}
            {!loading && activeTab === "courses" ? (
              <AdminCoursesTab courses={courses} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onDelete={removeCourse} />
            ) : null}
            {!loading && activeTab === "orders" ? (
              <AdminOrdersTab orders={orders} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onExport={handleExportOrders} onChangeStatus={changeOrderStatus} />
            ) : null}
            {!loading && activeTab === "users" ? (
              <AdminUsersTab users={users} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onChangeRole={changeUserRole} onToggleLock={toggleUserLock} />
            ) : null}
            {!loading && activeTab === "instructors" ? (
              <InstructorsTab users={users} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onToggleInstructor={changeInstructorRole} />
            ) : null}
            {!loading && activeTab === "categories" ? <CategoriesTab /> : null}
            {!loading && activeTab === "coupons" ? <CouponsTab /> : null}
            {!loading && activeTab === "blog" ? <BlogTab /> : null}
            {!loading && activeTab === "logs" ? <ActivityLogsTab /> : null}
            {!loading && activeTab === "seo" ? <SEOTab /> : null}
            {!loading && activeTab === "config" ? <SystemConfigTab /> : null}
          </div>
        </main>
      </div>
    </div>
  );
}
