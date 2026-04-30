import { Activity, BarChart2, BookOpen, FileText, Package, Search, Settings, Tag, Users, Video } from "lucide-react";
import type { ReactNode } from "react";
import type { AdminTab } from "@/components/admin/adminDashboardTypes";

export type AdminDashboardTabItem = {
  id: AdminTab;
  label: string;
  icon: ReactNode;
  badge?: number;
};

type Translate = (en: string, vi: string, es?: string, fr?: string) => string;

export function buildAdminDashboardTabs(counts: { courses: number; orders: number; users: number }, tx: Translate): AdminDashboardTabItem[] {
  return [
    { id: "overview", label: tx("Overview", "Tổng quan"), icon: <BarChart2 className="size-4" /> },
    { id: "courses", label: tx("Courses", "Khóa học"), icon: <BookOpen className="size-4" />, badge: counts.courses },
    { id: "orders", label: tx("Orders", "Đơn hàng"), icon: <Package className="size-4" />, badge: counts.orders },
    { id: "users", label: tx("Users", "Người dùng"), icon: <Users className="size-4" />, badge: counts.users },
    { id: "instructors", label: tx("Instructors", "Giảng viên"), icon: <Video className="size-4" /> },
    { id: "categories", label: tx("Categories", "Danh mục"), icon: <Tag className="size-4" /> },
    { id: "coupons", label: tx("Coupons", "Mã giảm giá"), icon: <Tag className="size-4" /> },
    { id: "blog", label: tx("Blog", "Blog"), icon: <FileText className="size-4" /> },
    { id: "logs", label: tx("Logs", "Nhật ký"), icon: <Activity className="size-4" /> },
    { id: "seo", label: tx("SEO", "SEO"), icon: <Search className="size-4" /> },
    { id: "config", label: tx("Settings", "Cấu hình"), icon: <Settings className="size-4" /> },
  ];
}

export function buildAdminTabDescriptions(tx: Translate): Record<AdminTab, string> {
  return {
    overview: tx("Business activity overview", "Tổng quan hoạt động kinh doanh"),
    courses: tx("Course management", "Quản lý khóa học"),
    orders: tx("Order management", "Quản lý đơn hàng"),
    users: tx("Manage user accounts and roles", "Quản lý tài khoản người dùng và phân quyền"),
    instructors: tx("Review and approve new instructors", "Xem xét và phê duyệt giảng viên mới"),
    categories: tx("Course category CRUD", "CRUD danh mục khóa học"),
    coupons: tx("Create and manage discount codes", "Tạo và quản lý mã giảm giá"),
    blog: tx("Manage blog posts and news", "Quản lý bài viết và tin tức"),
    logs: tx("Admin activity history", "Lịch sử hoạt động quản trị viên"),
    seo: tx("Advanced SEO settings per page", "Cài đặt SEO nâng cao cho từng trang"),
    config: tx("General system configuration", "Cấu hình chung hệ thống"),
  };
}

export const ADMIN_TAB_ROUTES: Record<AdminTab, string> = {
  overview: "/admin",
  courses: "/admin/courses",
  orders: "/admin/orders",
  users: "/admin/users",
  instructors: "/admin/instructors",
  categories: "/admin/categories",
  coupons: "/admin/coupons",
  blog: "/admin/blog",
  logs: "/admin/activity-log",
  seo: "/admin/seo",
  config: "/admin/settings",
};
