"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, Navigate } from "@/figma/compat/router";
import {
  Activity,
  BarChart2,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  Mail,
  Package,
  Pencil,
  Phone,
  Plus,
  Search,
  Settings,
  Shield,
  Tag,
  Trash2,
  Users,
  Video,
  FileText,
} from "lucide-react";
import {
  deleteCourse,
  fetchAdminOrders,
  fetchAdminStatsOverview,
  fetchAdminUsers,
  fetchInstructorCourses,
  formatPrice,
  formatPriceCompact,
  updateAdminOrderStatus,
  updateAdminUserRoles,
  updateAdminUserStatus,
  type AdminOrderDto,
  type AdminStatsOverviewDto,
  type AdminUserDto,
  type CourseManageDto,
} from "../data/api";
import { resolveApiAsset } from "@/lib/api";
import { toast } from "@/figma/compat/sonner";
import ActivityLogsTab from "../components/admin/ActivityLogsTab";
import BlogTab from "../components/admin/BlogTab";
import CategoriesTab from "../components/admin/CategoriesTab";
import CouponsTab from "../components/admin/CouponsTab";
import InstructorsTab from "../components/admin/InstructorsTab";
import OverviewTab from "../components/admin/OverviewTab";
import SEOTab from "../components/admin/SEOTab";
import SystemConfigTab from "../components/admin/SystemConfigTab";

export type AdminTab =
  | "overview"
  | "courses"
  | "orders"
  | "users"
  | "instructors"
  | "categories"
  | "coupons"
  | "blog"
  | "logs"
  | "seo"
  | "config";

const TAB_ROUTES: Record<AdminTab, string> = {
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

const orderStatusConfig: Record<string, { label: string; className: string }> = {
  paid: { label: "Hoàn thành", className: "bg-green-100 text-green-700" },
  completed: { label: "Hoàn thành", className: "bg-green-100 text-green-700" },
  processing: { label: "Đang xử lý", className: "bg-blue-100 text-blue-700" },
  pending: { label: "Chờ xử lý", className: "bg-yellow-100 text-yellow-700" },
  cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-700" },
};

function formatOrderStatus(status: string) {
  return orderStatusConfig[status] ?? {
    label: status,
    className: "bg-slate-100 text-slate-700",
  };
}

function fullName(user: AdminUserDto) {
  const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return name || user.email;
}

function buildFallbackOverviewStats(
  courses: CourseManageDto[],
  orders: AdminOrderDto[],
  users: AdminUserDto[],
): AdminStatsOverviewDto {
  const now = new Date();
  const start7Days = new Date(now);
  start7Days.setDate(now.getDate() - 6);
  start7Days.setHours(0, 0, 0, 0);

  const start30Days = new Date(now);
  start30Days.setDate(now.getDate() - 29);
  start30Days.setHours(0, 0, 0, 0);

  const revenueByDay = new Map<string, number>();
  const enrollmentsByDay = new Map<string, number>();

  for (let i = 0; i < 30; i += 1) {
    const day = new Date(start30Days);
    day.setDate(start30Days.getDate() + i);
    revenueByDay.set(day.toISOString().slice(0, 10), 0);
  }

  for (let i = 0; i < 7; i += 1) {
    const day = new Date(start7Days);
    day.setDate(start7Days.getDate() + i);
    enrollmentsByDay.set(day.toISOString().slice(0, 10), 0);
  }

  for (const order of orders) {
    const createdAt = order.createdAt?.slice(0, 10);
    if (createdAt && revenueByDay.has(createdAt)) {
      revenueByDay.set(createdAt, (revenueByDay.get(createdAt) ?? 0) + Number(order.total || 0));
    }
    if (createdAt && enrollmentsByDay.has(createdAt)) {
      enrollmentsByDay.set(createdAt, (enrollmentsByDay.get(createdAt) ?? 0) + 1);
    }
  }

  const ordersByStatusMap = new Map<string, number>();
  for (const order of orders) {
    const key = order.status || "unknown";
    ordersByStatusMap.set(key, (ordersByStatusMap.get(key) ?? 0) + 1);
  }

  const topCoursesByRevenue = [...courses]
    .sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0))
    .slice(0, 5)
    .map((course) => ({
      courseId: course.id,
      courseTitle: course.title,
      revenue: Number(course.revenue || 0),
      orders: course.studentCount || 0,
    }));

  const averageRating =
    courses.length > 0
      ? courses.reduce((sum, course) => sum + Number(course.averageRating || 0), 0) /
        courses.length
      : 0;

  return {
    totalUsers: users.length,
    totalCourses: courses.length,
    publishedCourses: courses.filter((course) => course.isPublished).length,
    totalEnrollments: orders.reduce(
      (sum, order) => sum + (order.items?.reduce((itemSum, item) => itemSum + Number(item.quantity || 0), 0) ?? 0),
      0,
    ),
    totalLessons: courses.reduce((sum, course) => sum + Number(course.totalLessons || 0), 0),
    openSupportTickets: 0,
    activeStudents30d: Math.min(users.length, 9999),
    totalRevenue: orders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    averageRating,
    enrollmentsLast7Days: Array.from(enrollmentsByDay.entries()).map(([date, count]) => ({
      date,
      count,
    })),
    revenueLast30Days: Array.from(revenueByDay.entries()).map(([date, value]) => ({
      date,
      value,
    })),
    ordersByStatus: Array.from(ordersByStatusMap.entries()).map(([status, count]) => ({
      status,
      count,
    })),
    topCoursesByRevenue,
  };
}

function exportCSV(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((key) => JSON.stringify(row[key] ?? "")).join(",")),
  ].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard({
  initialTab = "overview",
}: {
  initialTab?: AdminTab;
}) {
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

      if (courseResult.status === "fulfilled") {
        setCourses(courseResult.value);
      }

      if (orderResult.status === "fulfilled") {
        setOrders(orderResult.value);
      }

      if (userResult.status === "fulfilled") {
        setUsers(userResult.value);
      }

      if (statsResult.status === "fulfilled") {
        setStats(statsResult.value);
      }

      if (!cancelled) setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const totalRevenue =
    stats?.totalRevenue ?? orders.reduce((sum, order) => sum + order.total, 0);
  const totalUsers = stats?.totalUsers ?? users.length;
  const totalCourses = stats?.totalCourses ?? courses.length;
  const overviewStats = useMemo(
    () => stats ?? buildFallbackOverviewStats(courses, orders, users),
    [stats, courses, orders, users]
  );

  if (!isAdmin) return <Navigate to="/" replace />;

  const tabDescriptions: Record<AdminTab, string> = {
    overview: "Tổng quan hoạt động kinh doanh",
    courses: `${courses.length} khóa học đang hoạt động`,
    orders: `${orders.length} đơn hàng | ${orders.filter((order) => order.status === "processing").length} đang xử lý`,
    users: "Quản lý tài khoản người dùng và phân quyền",
    instructors: "Xem xét và phê duyệt giảng viên mới",
    categories: "CRUD danh mục khóa học",
    coupons: "Tạo và quản lý mã giảm giá",
    blog: "Quản lý bài viết và tin tức",
    logs: "Lịch sử hoạt động quản trị viên",
    seo: "Cài đặt SEO nâng cao cho từng trang",
    config: "Cấu hình chung hệ thống",
  };

  const tabs: { id: AdminTab; label: string; icon: ReactNode; badge?: number }[] = [
    { id: "overview", label: "Tổng quan", icon: <BarChart2 className="size-4" /> },
    { id: "courses", label: "Khóa học", icon: <BookOpen className="size-4" />, badge: courses.length },
    { id: "orders", label: "Đơn hàng", icon: <Package className="size-4" />, badge: orders.length },
    { id: "users", label: "Người dùng", icon: <Users className="size-4" />, badge: users.length },
    { id: "instructors", label: "Giảng viên", icon: <Video className="size-4" /> },
    { id: "categories", label: "Danh mục", icon: <Tag className="size-4" /> },
    { id: "coupons", label: "Mã giảm giá", icon: <Tag className="size-4" /> },
    { id: "blog", label: "Blog", icon: <FileText className="size-4" /> },
    { id: "logs", label: "Nhật ký", icon: <Activity className="size-4" /> },
    { id: "seo", label: "SEO", icon: <Search className="size-4" /> },
    { id: "config", label: "Cấu hình", icon: <Settings className="size-4" /> },
  ];

  async function changeOrderStatus(id: number, status: string) {
    await updateAdminOrderStatus(id, status);
    setOrders((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, status } : entry))
    );
    toast.success("Đã cập nhật trạng thái đơn hàng");
  }

  async function changeUserRole(target: AdminUserDto, makeAdmin: boolean) {
    if (user?.id === target.id && !makeAdmin) {
      toast.error("Không thể tự bỏ quyền admin");
      return;
    }
    const roles = ["User", ...target.roles.filter((role) => !["user", "admin"].includes(role.toLowerCase()))];
    if (makeAdmin) roles.push("Admin");
    await updateAdminUserRoles(target.id, roles);
    setUsers((current) =>
      current.map((entry) =>
        entry.id === target.id ? { ...entry, roles, isAdmin: makeAdmin } : entry
      )
    );
    toast.success("Đã cập nhật quyền");
  }

  async function toggleUserLock(target: AdminUserDto) {
    const lockUser = target.status !== "locked";
    if (user?.id === target.id && lockUser) {
      toast.error("Không thể tự khóa tài khoản");
      return;
    }
    await updateAdminUserStatus(target.id, lockUser);
    setUsers((current) =>
      current.map((entry) =>
        entry.id === target.id
          ? { ...entry, status: lockUser ? "locked" : "active" }
          : entry
      )
    );
    toast.success(lockUser ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản");
  }

  async function changeInstructorRole(target: AdminUserDto, enableInstructor: boolean) {
    const baseRoles = target.roles.filter(
      (role) => role.toLowerCase() !== "instructor"
    );
    const roles = enableInstructor ? [...baseRoles, "Instructor"] : baseRoles;

    await updateAdminUserRoles(target.id, roles);
    setUsers((current) =>
      current.map((entry) =>
        entry.id === target.id ? { ...entry, roles } : entry
      )
    );
    toast.success(
      enableInstructor ? "Đã cấp quyền giảng viên" : "Đã gỡ quyền giảng viên"
    );
  }

  async function removeCourse(target: CourseManageDto) {
    const confirmed =
      typeof window === "undefined"
        ? true
        : window.confirm(`XÃ³a khÃ³a há»c "${target.title}"? HÃ nh Ä‘á»™ng nÃ y khÃ´ng thá»ƒ hoÃ n tÃ¡c.`);

    if (!confirmed) {
      return;
    }

    await deleteCourse(target.id);
    setCourses((current) => current.filter((entry) => entry.id !== target.id));
    toast.success("Đã xóa khóa học");
  }

  const handleExportOrders = () => {
    exportCSV(
      orders.map((order) => ({
        "Mã đơn": order.id,
        "Khách hàng": order.userName || order.userEmail,
        Email: order.userEmail,
        "Tổng tiền": order.total,
        "Trạng thái": order.status,
        "Ngày tạo": order.createdAt,
      })),
      "don-hang.csv"
    );
    toast.success("Đã xuất đơn hàng");
  };

  const handleExportCourses = () => {
    exportCSV(
      courses.map((course) => ({
        "Tên khóa học": course.title,
        "Giảng viên": course.instructorName ?? "Đang cập nhật",
        Giá: course.price,
        "Học viên": course.studentCount,
        "Đánh giá": course.averageRating,
        "Danh mục": course.category?.title ?? "Khác",
        "Cấp độ": course.level,
      })),
      "khoa-hoc.csv"
    );
    toast.success("Đã xuất khóa học");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="lg:hidden text-white/80 hover:text-white">
                <Shield className="size-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-indigo-200 text-sm">Chào mừng, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:grid grid-cols-4 gap-3">
                {[
                  { label: "Doanh thu", value: formatPriceCompact(totalRevenue), icon: <Shield className="size-4" /> },
                  { label: "Đơn hàng", value: orders.length, icon: <Package className="size-4" /> },
                  { label: "Học viên", value: totalUsers, icon: <Users className="size-4" /> },
                  { label: "Khóa học", value: totalCourses, icon: <BookOpen className="size-4" /> },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/10 rounded-lg px-3 py-2 flex items-center gap-2 whitespace-nowrap">
                    <div className="text-white/70">{stat.icon}</div>
                    <div>
                      <div className="font-bold text-sm">{stat.value}</div>
                      <div className="text-white/60 text-xs">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/" className="text-white/80 hover:text-white text-sm underline underline-offset-2 hidden sm:block">
                ← Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <aside className="hidden w-56 shrink-0 lg:flex">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden sticky top-6 w-full">
            <div className="p-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Quản lý</p>
              <nav className="space-y-0.5">
                {tabs.map((tab) => (
                  <Link
                    key={tab.id}
                    to={TAB_ROUTES[tab.id]}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {tab.icon}
                      {tab.label}
                    </div>
                    {tab.badge !== undefined ? (
                      <span
                        className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                          activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {tab.badge}
                      </span>
                    ) : null}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-5 p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">
                  {tabs.find((tab) => tab.id === activeTab)?.label}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">{tabDescriptions[activeTab]}</p>
              </div>
              <div className="flex items-center gap-2">
                {activeTab === "orders" && (
                  <button
                    onClick={handleExportOrders}
                    className="flex items-center gap-1.5 text-sm border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
                  >
                    <Download className="size-4" /> Export CSV
                  </button>
                )}
                {activeTab === "courses" && (
                  <button
                    onClick={handleExportCourses}
                    className="flex items-center gap-1.5 text-sm border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
                  >
                    <Download className="size-4" /> Export CSV
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            {loading ? <div className="text-sm text-slate-500">Đang tải dữ liệu...</div> : null}
            {!loading && activeTab === "overview" ? <OverviewTab stats={overviewStats} /> : null}
            {!loading && activeTab === "courses" ? (
              <CoursesTab
                courses={courses}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onDelete={removeCourse}
              />
            ) : null}
            {!loading && activeTab === "orders" ? (
              <OrdersTab
                orders={orders}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onExport={handleExportOrders}
                onChangeStatus={changeOrderStatus}
              />
            ) : null}
            {!loading && activeTab === "users" ? (
              <UsersTab
                users={users}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onChangeRole={changeUserRole}
                onToggleLock={toggleUserLock}
              />
            ) : null}
            {!loading && activeTab === "instructors" ? (
              <InstructorsTab
                users={users}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onToggleInstructor={changeInstructorRole}
              />
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

function CoursesTab({
  courses,
  searchQuery,
  setSearchQuery,
  onDelete,
}: {
  courses: CourseManageDto[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onDelete: (course: CourseManageDto) => Promise<void>;
}) {
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);

  const visible = useMemo(() => {
    return courses.filter((course) =>
      `${course.title} ${course.category?.title ?? ""} ${course.language} ${course.level}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [courses, searchQuery]);

  const totalStudents = courses.reduce((sum, course) => sum + course.studentCount, 0);
  const avgRating = courses.length
    ? (courses.reduce((sum, course) => sum + course.averageRating, 0) / courses.length).toFixed(1)
    : "0.0";
  const avgPrice = courses.length
    ? formatPriceCompact(courses.reduce((sum, course) => sum + course.price, 0) / courses.length)
    : formatPriceCompact(0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Tìm kiếm khóa học, giảng viên, danh mục..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <Link
          to="/admin/courses/new"
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition whitespace-nowrap text-sm font-medium"
        >
          <Plus className="size-4" /> Thêm khóa học
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Tổng khóa học", value: courses.length, color: "blue" },
          { label: "Học viên", value: totalStudents.toLocaleString("vi-VN"), color: "green" },
          { label: "Đánh giá TB", value: `${avgRating}★`, color: "yellow" },
          { label: "Giá TB", value: avgPrice, color: "purple" },
        ].map((stat) => (
          <div key={stat.label} className={`bg-${stat.color}-50 rounded-lg p-3 text-center`}>
            <p className={`font-bold text-${stat.color}-700`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {visible.map((course) => {
          const isExpanded = expandedCourse === course.id;
          const instructorName = course.instructorName ?? "Đang cập nhật";
          return (
            <div key={course.id} className="border border-gray-200 rounded-xl overflow-hidden hover:border-blue-200 transition">
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
              >
                <img
                  src={resolveApiAsset(course.thumbnailUrl)}
                  alt={course.title}
                  className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{course.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                    <span>{instructorName}</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {course.category?.title ?? "Khác"}
                    </span>
                    <span>{course.studentCount.toLocaleString("vi-VN")} học viên</span>
                    <span className="text-yellow-600">{course.averageRating.toFixed(1)}★</span>
                    <span className="text-blue-600 font-semibold">{formatPriceCompact(course.price)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Link
                    to={`/courses/${course.slug}`}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Eye className="size-4" />
                  </Link>
                  <Link
                    to={`/admin/courses/edit/${course.id}`}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Pencil className="size-4" />
                  </Link>
                  <button
                    type="button"
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"
                    onClick={(event) => {
                      event.stopPropagation();
                      void onDelete(course);
                    }}
                  >
                    <Trash2 className="size-4" />
                  </button>
                  {isExpanded ? (
                    <ChevronUp className="size-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="size-4 text-gray-400" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Mô tả</p>
                      <p className="text-sm text-gray-700">
                        {course.category?.title
                          ? `Khóa học thuộc danh mục ${course.category.title}.`
                          : "Chưa có mô tả chi tiết cho khóa học."}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Thông tin</p>
                      <div className="space-y-1 text-sm text-gray-700">
                        <p>⏱ {course.totalLessons} bài học</p>
                        <p>📊 {course.level}</p>
                        <p>💰 {formatPrice(course.price)} · Doanh thu {formatPrice(course.revenue ?? 0)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Cập nhật</p>
                      <p className="text-sm text-gray-700">
                        {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString("vi-VN") : "Gần đây"}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">Review: {course.reviewCount} lượt</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrdersTab({
  orders,
  searchQuery,
  setSearchQuery,
  onExport,
  onChangeStatus,
}: {
  orders: AdminOrderDto[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onExport: () => void;
  onChangeStatus: (id: number, status: string) => Promise<void>;
}) {
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const visible = useMemo(() => {
    return orders
      .filter((order) =>
        `${order.id} ${order.userEmail} ${order.userName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
      .filter((order) => (statusFilter === "all" ? true : order.status === statusFilter));
  }, [orders, searchQuery, statusFilter]);

  const statusOptions = ["pending", "processing", "completed", "cancelled"];

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Tìm đơn hàng (mã, tên, email)..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="processing">Đang xử lý</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        <button
          type="button"
          onClick={onExport}
          className="flex items-center gap-1.5 text-sm border border-gray-200 text-gray-600 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition"
        >
          <Download className="size-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {statusOptions.map((status) => {
          const config = formatOrderStatus(status);
          return (
            <div
              key={status}
              className={`rounded-lg p-3 text-center cursor-pointer border-2 transition ${
                statusFilter === status ? "border-blue-400" : "border-transparent"
              } ${config.className}`}
              onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
            >
              <p className="font-bold">{orders.filter((order) => order.status === status).length}</p>
              <p className="text-xs mt-0.5">{config.label}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        {visible.map((order) => {
          const status = formatOrderStatus(order.status);
          const isExpanded = expandedOrder === order.id;
          return (
            <div key={order.id} className="border border-gray-200 rounded-xl overflow-hidden">
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                    <span className="font-mono font-bold text-gray-900 text-sm">#{order.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Mail className="size-3" />
                      {order.userEmail}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                    <span className="font-semibold text-blue-600">{formatPrice(order.total)}</span>
                    <span>{order.items.length} khóa học</span>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="size-4 text-gray-400" />
                ) : (
                  <ChevronDown className="size-4 text-gray-400" />
                )}
              </div>

              {isExpanded && (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <div className="space-y-2 mb-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 bg-white rounded-lg p-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{item.courseTitle}</p>
                          <p className="text-xs text-gray-500">
                            {item.quantity} x {formatPrice(item.unitPrice)}
                          </p>
                        </div>
                        <p className="font-semibold text-blue-600 text-sm">{formatPrice(item.lineTotal)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="text-sm text-gray-600 space-y-0.5">
                      <p>💳 Thanh toán online {order.couponCode && `· Mã: ${order.couponCode}`}</p>
                      {order.discountTotal > 0 && (
                        <p className="text-green-600">-{formatPrice(order.discountTotal)} giảm giá</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={order.status}
                        onChange={(event) => void onChangeStatus(order.id, event.target.value)}
                      >
                        <option value="pending">Chờ xử lý</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {visible.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Package className="size-12 mx-auto mb-3 opacity-30" />
            <p>Không tìm thấy đơn hàng nào</p>
          </div>
        )}
      </div>
    </div>
  );
}

function UsersTab({
  users,
  searchQuery,
  setSearchQuery,
  onChangeRole,
  onToggleLock,
}: {
  users: AdminUserDto[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onChangeRole: (target: AdminUserDto, makeAdmin: boolean) => Promise<void>;
  onToggleLock: (target: AdminUserDto) => Promise<void>;
}) {
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const visible = useMemo(() => {
    return users
      .filter((entry) =>
        `${fullName(entry)} ${entry.email} ${entry.phoneNumber ?? ""}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
      .filter((entry) => {
        const roleMatches =
          roleFilter === "all"
            ? true
            : roleFilter === "admin"
              ? entry.isAdmin
              : entry.roles.some((role) => role.toLowerCase() === roleFilter);
        const statusMatches = statusFilter === "all" ? true : entry.status === statusFilter;
        return roleMatches && statusMatches;
      });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const levelColors: Record<string, string> = {
    Platinum: "bg-purple-100 text-purple-700",
    Gold: "bg-yellow-100 text-yellow-700",
    Silver: "bg-gray-100 text-gray-600",
    Bronze: "bg-orange-100 text-orange-700",
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="font-bold text-blue-700">{users.length}</p>
          <p className="text-xs text-gray-500">Người dùng</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <p className="font-bold text-purple-700">{users.filter((entry) => entry.isAdmin).length}</p>
          <p className="text-xs text-gray-500">Quản trị viên</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <p className="font-bold text-red-700">{users.filter((entry) => entry.status === "locked").length}</p>
          <p className="text-xs text-gray-500">Đã khóa</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Tìm người dùng (tên, email, phone)..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="admin">Admin</option>
          <option value="instructor">Giảng viên</option>
          <option value="user">Học viên</option>
        </select>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="locked">Đang khóa</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Người dùng</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Liên hệ</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vai trò</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cấp độ</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Điểm / KH</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ngày tham gia</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {visible.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="size-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {fullName(entry).charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{fullName(entry)}</p>
                      {entry.status === "locked" && <span className="text-xs text-red-500">Đã khóa</span>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-xs text-gray-700 flex items-center gap-1">
                    <Mail className="size-3" />
                    {entry.email}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Phone className="size-3" />
                    {entry.phoneNumber || "Chưa cập nhật"}
                  </p>
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      entry.isAdmin ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {entry.isAdmin ? "🛡️ Admin" : "👤 User"}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      levelColors[entry.loyaltyTier] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {entry.loyaltyTier || "Standard"}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-sm">
                  <span className="font-medium text-gray-900">{entry.loyaltyPoints.toLocaleString()} đ</span>
                  <span className="text-gray-400 mx-1">·</span>
                  <span className="text-blue-600">{entry.courseCount} KH</span>
                </td>
                <td className="px-4 py-3.5 text-xs text-gray-500">
                  {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString("vi-VN") : "Chưa rõ"}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => void onChangeRole(entry, !entry.isAdmin)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition text-xs font-medium"
                    >
                      {entry.isAdmin ? "Bỏ admin" : "Cấp admin"}
                    </button>
                    {entry.status === "locked" ? (
                      <button
                        onClick={() => void onToggleLock(entry)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition text-xs font-medium"
                      >
                        Mở
                      </button>
                    ) : (
                      <button
                        onClick={() => void onToggleLock(entry)}
                        className="p-1.5 text-orange-500 hover:bg-orange-50 rounded transition text-xs font-medium"
                      >
                        Khóa
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visible.length === 0 && (
        <div className="mt-4 rounded-2xl border border-dashed border-gray-200 px-4 py-10 text-center text-sm text-gray-500">
          Không tìm thấy người dùng phù hợp.
        </div>
      )}
    </div>
  );
}
