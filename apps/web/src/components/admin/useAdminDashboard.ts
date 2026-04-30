"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/app/providers";
import {
  deleteCourse,
  fetchAdminOrders,
  fetchAdminStatsOverview,
  fetchAdminUsers,
  fetchInstructorCourses,
  updateAdminOrderStatus,
  updateAdminUserRoles,
  updateAdminUserStatus,
  type AdminOrderDto,
  type AdminStatsOverviewDto,
  type AdminUserDto,
  type CourseManageDto,
} from "@/services/api";
import { toast } from "@/lib/notify";
import { buildFallbackOverviewStats, exportCSV } from "@/components/admin/adminDashboardUtils";
import { ADMIN_TAB_ROUTES } from "@/components/admin/adminDashboardTabs";
import type { AdminTab } from "@/components/admin/adminDashboardTypes";

export function useAdminDashboard(initialTab: AdminTab = "overview") {
  const { tx } = useI18n();
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<CourseManageDto[]>([]);
  const [orders, setOrders] = useState<AdminOrderDto[]>([]);
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [stats, setStats] = useState<AdminStatsOverviewDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveTab(initialTab);
    setSearchQuery("");
  }, [initialTab]);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      const [courseResult, orderResult, userResult, statsResult] = await Promise.allSettled([
        fetchInstructorCourses(),
        fetchAdminOrders(),
        fetchAdminUsers(),
        fetchAdminStatsOverview(),
      ]);

      if (cancelled) return;

      if (courseResult.status === "fulfilled") setCourses(courseResult.value);
      if (orderResult.status === "fulfilled") setOrders(orderResult.value);
      if (userResult.status === "fulfilled") setUsers(userResult.value);
      if (statsResult.status === "fulfilled") setStats(statsResult.value);
      if (!cancelled) setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const totalRevenue = stats?.totalRevenue ?? orders.reduce((sum, order) => sum + order.total, 0);
  const totalUsers = stats?.totalUsers ?? users.length;
  const totalCourses = stats?.totalCourses ?? courses.length;
  const overviewStats = useMemo(() => stats ?? buildFallbackOverviewStats(courses, orders, users), [stats, courses, orders, users]);

  async function changeOrderStatus(id: number, status: string) {
    await updateAdminOrderStatus(id, status);
    setOrders((current) => current.map((entry) => (entry.id === id ? { ...entry, status } : entry)));
    toast.success(tx("Order status updated.", "Đã cập nhật trạng thái đơn hàng"));
  }

  async function changeUserRole(target: AdminUserDto, makeAdmin: boolean) {
    if (user?.id === target.id && !makeAdmin) {
      toast.error(tx("You cannot remove your own admin role.", "Không thể tự bỏ quyền admin"));
      return;
    }
    const roles = ["User", ...target.roles.filter((role) => !["user", "admin"].includes(role.toLowerCase()))];
    if (makeAdmin) roles.push("Admin");
    await updateAdminUserRoles(target.id, roles);
    setUsers((current) => current.map((entry) => (entry.id === target.id ? { ...entry, roles, isAdmin: makeAdmin } : entry)));
    toast.success(tx("User roles updated.", "Đã cập nhật quyền"));
  }

  async function toggleUserLock(target: AdminUserDto) {
    const lockUser = target.status !== "locked";
    if (user?.id === target.id && lockUser) {
      toast.error(tx("You cannot lock your own account.", "Không thể tự khóa tài khoản"));
      return;
    }
    await updateAdminUserStatus(target.id, lockUser);
    setUsers((current) => current.map((entry) => (entry.id === target.id ? { ...entry, status: lockUser ? "locked" : "active" } : entry)));
    toast.success(lockUser ? tx("Account locked.", "Đã khóa tài khoản") : tx("Account unlocked.", "Đã mở khóa tài khoản"));
  }

  async function changeInstructorRole(target: AdminUserDto, enableInstructor: boolean) {
    const baseRoles = target.roles.filter((role) => role.toLowerCase() !== "instructor");
    const roles = enableInstructor ? [...baseRoles, "Instructor"] : baseRoles;

    await updateAdminUserRoles(target.id, roles);
    setUsers((current) => current.map((entry) => (entry.id === target.id ? { ...entry, roles } : entry)));
    toast.success(enableInstructor ? tx("Instructor role granted.", "Đã cấp quyền giảng viên") : tx("Instructor role removed.", "Đã gỡ quyền giảng viên"));
  }

  async function removeCourse(target: CourseManageDto) {
    const confirmed = typeof window === "undefined" ? true : window.confirm(tx(`Delete course "${target.title}"? This cannot be undone.`, `Xóa khóa học "${target.title}"? Hành động này không thể hoàn tác.`));
    if (!confirmed) return;
    await deleteCourse(target.id);
    setCourses((current) => current.filter((entry) => entry.id !== target.id));
    toast.success(tx("Course deleted.", "Đã xóa khóa học"));
  }

  const handleExportOrders = () => {
    exportCSV(
      orders.map((order) => ({
        [tx("Order ID", "Mã đơn")]: order.id,
        [tx("Customer", "Khách hàng")]: order.userName || order.userEmail,
        Email: order.userEmail,
        [tx("Total", "Tổng tiền")]: order.total,
        [tx("Status", "Trạng thái")]: order.status,
        [tx("Created at", "Ngày tạo")]: order.createdAt,
      })),
      "orders.csv"
    );
    toast.success(tx("Orders exported.", "Đã xuất đơn hàng"));
  };

  const handleExportCourses = () => {
    exportCSV(
      courses.map((course) => ({
        [tx("Course title", "Tên khóa học")]: course.title,
        [tx("Instructor", "Giảng viên")]: course.instructorName ?? tx("Updating", "Đang cập nhật"),
        [tx("Price", "Giá")]: course.price,
        [tx("Students", "Học viên")]: course.studentCount,
        [tx("Rating", "Đánh giá")]: course.averageRating,
        [tx("Category", "Danh mục")]: course.category?.title ?? tx("Other", "Khác"),
        [tx("Level", "Cấp độ")]: course.level,
      })),
      "courses.csv"
    );
    toast.success(tx("Courses exported.", "Đã xuất khóa học"));
  };

  return {
    user,
    isAdmin,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    courses,
    orders,
    users,
    stats,
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
    TAB_ROUTES: ADMIN_TAB_ROUTES,
  } as const;
}
