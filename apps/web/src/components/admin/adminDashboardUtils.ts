import type { AdminOrderDto, AdminStatsOverviewDto, AdminUserDto, CourseManageDto } from "@/services/api";

type Translate = (en: string, vi: string, es?: string, fr?: string) => string;

export function buildOrderStatusConfig(tx: Translate) {
  return {
    paid: { label: tx("Completed", "Hoàn thành"), className: "bg-green-100 text-green-700" },
    completed: { label: tx("Completed", "Hoàn thành"), className: "bg-green-100 text-green-700" },
    processing: { label: tx("Processing", "Đang xử lý"), className: "bg-blue-100 text-blue-700" },
    pending: { label: tx("Pending", "Chờ xử lý"), className: "bg-yellow-100 text-yellow-700" },
    cancelled: { label: tx("Cancelled", "Đã hủy"), className: "bg-red-100 text-red-700" },
  } as const;
}

export function formatOrderStatus(status: string, tx: Translate) {
  const orderStatusConfig = buildOrderStatusConfig(tx);
  return orderStatusConfig[status as keyof typeof orderStatusConfig] ?? {
    label: status,
    className: "bg-slate-100 text-slate-700",
  };
}

export function fullName(user: AdminUserDto) {
  const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return name || user.email;
}

export function buildFallbackOverviewStats(
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
      ? courses.reduce((sum, course) => sum + Number(course.averageRating || 0), 0) / courses.length
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

export function exportCSV(rows: Array<Record<string, string | number | boolean | null | undefined>>, filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(","), ...rows.map((row) => headers.map((key) => JSON.stringify(row[key] ?? "")).join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
