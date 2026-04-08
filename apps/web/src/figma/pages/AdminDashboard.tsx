"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "@/figma/compat/router";
import {
  Activity,
  BarChart2,
  BookOpen,
  Download,
  Lock,
  Mail,
  Package,
  Plus,
  Search,
  Settings,
  Shield,
  Tag,
  Unlock,
  Users,
} from "lucide-react";
import {
  fetchAdminOrders,
  fetchAdminStatsOverview,
  fetchAdminUsers,
  fetchCourses,
  formatPrice,
  formatPriceCompact,
  mapCourseList,
  updateAdminOrderStatus,
  updateAdminUserRoles,
  updateAdminUserStatus,
  type AdminOrderDto,
  type AdminStatsOverviewDto,
  type AdminUserDto,
} from "../data/api";
import type { Course } from "../contexts/CartContext";
import { toast } from "@/figma/compat/sonner";
import ActivityLogsTab from "../components/admin/ActivityLogsTab";
import BlogTab from "../components/admin/BlogTab";
import CategoriesTab from "../components/admin/CategoriesTab";
import CouponsTab from "../components/admin/CouponsTab";
import OverviewTab from "../components/admin/OverviewTab";
import SEOTab from "../components/admin/SEOTab";
import SystemConfigTab from "../components/admin/SystemConfigTab";

type Tab =
  | "overview"
  | "courses"
  | "orders"
  | "users"
  | "categories"
  | "coupons"
  | "blog"
  | "logs"
  | "seo"
  | "config";

const orderStatusConfig: Record<string, { label: string; className: string }> = {
  paid: { label: "Hoan thanh", className: "bg-green-100 text-green-700" },
  completed: { label: "Hoan thanh", className: "bg-green-100 text-green-700" },
  processing: { label: "Dang xu ly", className: "bg-blue-100 text-blue-700" },
  pending: { label: "Cho xu ly", className: "bg-yellow-100 text-yellow-700" },
  cancelled: { label: "Da huy", className: "bg-red-100 text-red-700" },
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

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [orders, setOrders] = useState<AdminOrderDto[]>([]);
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [stats, setStats] = useState<AdminStatsOverviewDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [courseDtos, orderDtos, userDtos, statsDto] = await Promise.all([
          fetchCourses({ pageSize: 200 }),
          fetchAdminOrders(),
          fetchAdminUsers(),
          fetchAdminStatsOverview(),
        ]);
        if (cancelled) return;
        setCourses(courseDtos.map((item) => mapCourseList(item)));
        setOrders(orderDtos);
        setUsers(userDtos);
        setStats(statsDto);
      } catch (error) {
        console.error(error);
        if (!cancelled) toast.error("Khong the tai du lieu admin");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isAdmin) return <Navigate to="/" replace />;

  const totalRevenue =
    stats?.totalRevenue ?? orders.reduce((sum, order) => sum + order.total, 0);

  const tabs: { id: Tab; label: string; icon: ReactNode; badge?: number }[] = [
    { id: "overview", label: "Tong quan", icon: <BarChart2 className="size-4" /> },
    { id: "courses", label: "Khoa hoc", icon: <BookOpen className="size-4" />, badge: courses.length },
    { id: "orders", label: "Don hang", icon: <Package className="size-4" />, badge: orders.length },
    { id: "users", label: "Nguoi dung", icon: <Users className="size-4" />, badge: users.length },
    { id: "categories", label: "Danh muc", icon: <Tag className="size-4" /> },
    { id: "coupons", label: "Coupons", icon: <Tag className="size-4" /> },
    { id: "blog", label: "Blog", icon: <Activity className="size-4" /> },
    { id: "logs", label: "Nhat ky", icon: <Activity className="size-4" /> },
    { id: "seo", label: "SEO", icon: <Search className="size-4" /> },
    { id: "config", label: "Cau hinh", icon: <Settings className="size-4" /> },
  ];

  async function changeOrderStatus(id: number, status: string) {
    await updateAdminOrderStatus(id, status);
    setOrders((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, status } : entry))
    );
    toast.success("Da cap nhat trang thai don hang");
  }

  async function changeUserRole(target: AdminUserDto, makeAdmin: boolean) {
    if (user?.id === target.id && !makeAdmin) {
      toast.error("Khong the tu bo quyen admin");
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
    toast.success("Da cap nhat quyen");
  }

  async function toggleUserLock(target: AdminUserDto) {
    const lockUser = target.status !== "locked";
    if (user?.id === target.id && lockUser) {
      toast.error("Khong the tu khoa tai khoan");
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
    toast.success(lockUser ? "Da khoa tai khoan" : "Da mo khoa tai khoan");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[linear-gradient(135deg,#102346_0%,#1f4b99_48%,#5e78ff_100%)] text-white">
        <div className="mx-auto max-w-screen-2xl px-4 py-5 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.28em] text-blue-100">Admin console</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Dieu hanh he thong</h1>
              <p className="mt-1 text-sm text-blue-100">Dang nhap voi quyen admin: {user?.name}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <TopPill icon={<Shield className="size-4" />} label="Doanh thu" value={formatPriceCompact(totalRevenue)} />
              <TopPill icon={<Package className="size-4" />} label="Don hang" value={String(orders.length)} />
              <TopPill icon={<Users className="size-4" />} label="Nguoi dung" value={String(users.length)} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-screen-2xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery("");
                }}
                className={`mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium ${
                  activeTab === tab.id
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-2">{tab.icon}{tab.label}</span>
                {typeof tab.badge === "number" ? <span className="text-xs">{tab.badge}</span> : null}
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {loading ? <div className="text-sm text-slate-500">Dang tai du lieu...</div> : null}
            {!loading && activeTab === "overview" ? <OverviewTab /> : null}
            {!loading && activeTab === "courses" ? (
              <CoursesTab
                courses={courses}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            ) : null}
            {!loading && activeTab === "orders" ? (
              <OrdersTab
                orders={orders}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onExport={() => {
                  exportCSV(
                    orders.map((order) => ({
                      id: order.id,
                      customer: order.userName || order.userEmail,
                      email: order.userEmail,
                      total: order.total,
                      status: order.status,
                      createdAt: order.createdAt,
                    })),
                    "admin-orders.csv"
                  );
                  toast.success("Da xuat don hang");
                }}
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

function TopPill({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm">
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <div className="font-semibold">{value}</div>
          <div className="text-xs text-blue-100">{label}</div>
        </div>
      </div>
    </div>
  );
}

function SearchInput({
  value,
  setValue,
  placeholder,
}: {
  value: string;
  setValue: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm focus:border-slate-400 focus:outline-none"
      />
    </div>
  );
}

function CoursesTab({
  courses,
  searchQuery,
  setSearchQuery,
}: {
  courses: Course[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}) {
  const filtered = courses.filter((course) =>
    `${course.title} ${course.instructor} ${course.category}`.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div>
      <div className="mb-4 flex gap-3">
        <div className="flex-1"><SearchInput value={searchQuery} setValue={setSearchQuery} placeholder="Tim khoa hoc..." /></div>
        <button type="button" onClick={() => toast.info("Dung studio hien co de them khoa hoc")} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white"><Plus className="mr-2 inline size-4" />Them khoa hoc</button>
      </div>
      <div className="space-y-3">
        {filtered.map((course) => (
          <div key={course.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">{course.title}</p>
                <p className="mt-1 text-xs text-slate-500">{course.instructor} · {course.category} · {course.students.toLocaleString("vi-VN")} hoc vien</p>
              </div>
              <p className="text-sm font-semibold text-blue-700">{formatPrice(course.price)}</p>
            </div>
          </div>
        ))}
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
  const filtered = orders.filter((order) =>
    `${order.id} ${order.userEmail} ${order.userName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div>
      <div className="mb-4 flex gap-3">
        <div className="flex-1"><SearchInput value={searchQuery} setValue={setSearchQuery} placeholder="Tim don hang..." /></div>
        <button type="button" onClick={onExport} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"><Download className="mr-2 inline size-4" />Export</button>
      </div>
      <div className="space-y-3">
        {filtered.map((order) => {
          const status = formatOrderStatus(order.status);
          return (
            <div key={order.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-slate-950">#{order.id}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${status.className}`}>{status.label}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{order.userName || order.userEmail} · {order.userEmail}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-blue-700">{formatPrice(order.total)}</span>
                  <select value={order.status} onChange={(event) => void onChangeStatus(order.id, event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
                    <option value="pending">Cho xu ly</option>
                    <option value="processing">Dang xu ly</option>
                    <option value="completed">Hoan thanh</option>
                    <option value="cancelled">Da huy</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
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
  const filtered = users.filter((entry) =>
    `${fullName(entry)} ${entry.email} ${entry.phoneNumber ?? ""}`.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div>
      <div className="mb-4"><SearchInput value={searchQuery} setValue={setSearchQuery} placeholder="Tim nguoi dung..." /></div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
            <tr>
              <th className="px-4 py-3">Nguoi dung</th>
              <th className="px-4 py-3">Lien he</th>
              <th className="px-4 py-3">Vai tro</th>
              <th className="px-4 py-3">Khoa hoc</th>
              <th className="px-4 py-3">Ngay tham gia</th>
              <th className="px-4 py-3">Thao tac</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((entry) => (
              <tr key={entry.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-950">{fullName(entry)}</p>
                  <p className="text-xs text-slate-500">{entry.status === "locked" ? "Dang khoa" : "Hoat dong"}</p>
                </td>
                <td className="px-4 py-3">
                  <p>{entry.email}</p>
                  <p className="text-xs text-slate-500">{entry.phoneNumber || "Chua cap nhat"}</p>
                </td>
                <td className="px-4 py-3">{entry.roles.join(", ")}</td>
                <td className="px-4 py-3">{entry.courseCount} khoa hoc</td>
                <td className="px-4 py-3">{entry.createdAt ? new Date(entry.createdAt).toLocaleDateString("vi-VN") : "Chua ro"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => void onChangeRole(entry, !entry.isAdmin)} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700">
                      {entry.isAdmin ? "Bo admin" : "Cap admin"}
                    </button>
                    <button type="button" onClick={() => void onToggleLock(entry)} className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium ${entry.status === "locked" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}>
                      {entry.status === "locked" ? <Unlock className="size-3.5" /> : <Lock className="size-3.5" />}
                      {entry.status === "locked" ? "Mo khoa" : "Khoa"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
