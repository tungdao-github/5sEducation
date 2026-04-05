"use client";

import { useEffect, useMemo, useState } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import Link from "next/link";
import { API_URL } from "@/lib/api";
import { notify } from "@/lib/notify";
import { useI18n } from "@/app/providers";

interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  isAdmin: boolean;
  roles?: string[];
  loyaltyPoints?: number;
  loyaltyTier?: string;
}

interface CategoryDto {
  id: number;
  title: string;
  slug: string;
  courseCount: number;
}

interface LearningPathDto {
  id: number;
  title: string;
  slug: string;
  description: string;
  level: string;
  thumbnailUrl: string;
  estimatedHours: number;
  courseCount: number;
  isPublished: boolean;
}

interface HomePageBlockDto {
  id: number;
  key: string;
  type: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaUrl: string;
  itemsJson: string;
  locale: string;
  sortOrder: number;
  isPublished: boolean;
}

interface OrderItemDto {
  id: number;
  courseId: number;
  courseTitle: string;
  courseSlug: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

interface OrderAdminDto {
  id: number;
  status: string;
  subtotal: number;
  discountTotal: number;
  total: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: OrderItemDto[];
}

interface SupportMessageDto {
  id: number;
  userId?: string | null;
  userEmail?: string | null;
  name: string;
  email: string;
  message: string;
  status: string;
  adminNote?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

interface SupportReplyDto {
  id: number;
  supportMessageId: number;
  authorRole: string;
  authorName: string;
  message: string;
  createdAt: string;
}

interface BlogPostListDto {
  id: number;
  title: string;
  slug: string;
  summary: string;
  coverImageUrl: string;
  authorName: string;
  tags: string[];
  locale: string;
  isPublished: boolean;
  createdAt: string;
  publishedAt?: string | null;
}

interface BlogPostDetailDto extends BlogPostListDto {
  content: string;
  seoTitle: string;
  seoDescription: string;
  updatedAt: string;
}

interface CourseManageDto {
  id: number;
  title: string;
  slug: string;
  price: number;
  flashSalePrice?: number | null;
  flashSaleStartsAt?: string | null;
  flashSaleEndsAt?: string | null;
  thumbnailUrl: string;
  level: string;
  language: string;
  isPublished: boolean;
  updatedAt: string;
  category?: { id: number; title: string; slug: string } | null;
}

interface CourseDetailAdminDto {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  outcome: string;
  requirements: string;
  language: string;
  price: number;
  flashSalePrice?: number | null;
  flashSaleStartsAt?: string | null;
  flashSaleEndsAt?: string | null;
  level: string;
  previewVideoUrl: string;
  thumbnailUrl: string;
  isPublished: boolean;
  category?: { id: number; title: string; slug: string } | null;
}

interface AdminStatsOverview {
  totalUsers: number;
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  totalLessons: number;
  openSupportTickets: number;
  activeStudents30d: number;
  totalRevenue: number;
  averageRating: number;
  enrollmentsLast7Days: { date: string; count: number }[];
  revenueLast30Days: { date: string; value: number }[];
  ordersByStatus: { status: string; count: number }[];
  topCoursesByRevenue: { courseId: number; courseTitle: string; revenue: number; orders: number }[];
}

interface AdminReviewDto {
  id: number;
  courseId: number;
  courseTitle: string;
  rating: number;
  comment: string;
  userId: string;
  userEmail: string;
  userName: string;
  createdAt: string;
}

interface AdminAuditLogDto {
  id: number;
  userId: string;
  userEmail: string;
  action: string;
  path: string;
  method: string;
  ipAddress: string;
  createdAt: string;
  detail?: string | null;
}

interface SystemSettingDto {
  key: string;
  value: string;
  group: string;
  description?: string | null;
  updatedAt?: string;
}

const formatCurrency = (value: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);

const downloadCsvFile = (filename: string, rows: Array<Array<string | number | null | undefined>>) => {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const text = String(cell ?? "");
          if (text.includes(",") || text.includes("\"") || text.includes("\n")) {
            return `"${text.replace(/"/g, "\"\"")}"`;
          }
          return text;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
};

const parseCsv = (text: string) => {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === "\"") {
      if (inQuotes && text[i + 1] === "\"") {
        current += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "\n" && !inQuotes) {
      row.push(current.trim());
      current = "";
      if (row.some((cell) => cell.length > 0)) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    if (row.some((cell) => cell.length > 0)) {
      rows.push(row);
    }
  }

  return rows;
};

export default function AdminPage() {
  const { tx } = useI18n();
  const [needsAuth, setNeedsAuth] = useState(false);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [roleOptions, setRoleOptions] = useState<string[]>([]);
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [adminCourses, setAdminCourses] = useState<CourseManageDto[]>([]);
  const [courseForm, setCourseForm] = useState({
    title: "",
    categoryId: "",
    shortDescription: "",
    description: "",
    outcome: "",
    requirements: "",
    language: "English",
    price: 0,
    flashSalePrice: "",
    flashSaleStartsAt: "",
    flashSaleEndsAt: "",
    level: "Beginner",
    previewVideoUrl: "",
    isPublished: true,
  });
  const [courseThumbnail, setCourseThumbnail] = useState<File | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [courseFilter, setCourseFilter] = useState("");
  const [importingCourses, setImportingCourses] = useState(false);
  const [apiOffline, setApiOffline] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [learningPaths, setLearningPaths] = useState<LearningPathDto[]>([]);
  const [pathForm, setPathForm] = useState({
    title: "",
    description: "",
    level: "Beginner",
    thumbnailUrl: "",
    estimatedHours: 0,
    isPublished: true,
  });
  const [editingPathId, setEditingPathId] = useState<number | null>(null);
  const [homeBlocks, setHomeBlocks] = useState<HomePageBlockDto[]>([]);
  const [blockForm, setBlockForm] = useState({
    key: "",
    type: "hero",
    title: "",
    subtitle: "",
    imageUrl: "",
    ctaText: "",
    ctaUrl: "",
    itemsJson: "",
    locale: "",
    sortOrder: 1,
    isPublished: true,
  });
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);
  const [blockTypeFilter, setBlockTypeFilter] = useState("");
  const [draggingBlockId, setDraggingBlockId] = useState<number | null>(null);
  const [dragOverBlockId, setDragOverBlockId] = useState<number | null>(null);
  const [isReorderingBlocks, setIsReorderingBlocks] = useState(false);
  const [supportMessages, setSupportMessages] = useState<SupportMessageDto[]>([]);
  const [supportNotes, setSupportNotes] = useState<Record<number, string>>({});
  const [supportStatus, setSupportStatus] = useState<Record<number, string>>({});
  const [supportReplies, setSupportReplies] = useState<Record<number, SupportReplyDto[]>>({});
  const [supportReplyDraft, setSupportReplyDraft] = useState<Record<number, string>>({});
  const [blogPosts, setBlogPosts] = useState<BlogPostListDto[]>([]);
  const [orders, setOrders] = useState<OrderAdminDto[]>([]);
  const [orderStatusDraft, setOrderStatusDraft] = useState<Record<number, string>>({});
  const [orderExpanded, setOrderExpanded] = useState<Record<number, boolean>>({});
  const [orderFilter, setOrderFilter] = useState("");
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogDto[]>([]);
  const [auditQuery, setAuditQuery] = useState("");
  const [auditTake, setAuditTake] = useState(80);
  const [settingsValues, setSettingsValues] = useState<Record<string, string>>({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [reviews, setReviews] = useState<AdminReviewDto[]>([]);
  const [reviewQuery, setReviewQuery] = useState("");
  const [reviewTake, setReviewTake] = useState(120);
  const [reviewCourseFilter, setReviewCourseFilter] = useState("");
  const [stats, setStats] = useState<AdminStatsOverview | null>(null);
  const [blogForm, setBlogForm] = useState({
    title: "",
    slug: "",
    summary: "",
    content: "",
    coverImageUrl: "",
    authorName: "",
    tags: "",
    locale: "en",
    seoTitle: "",
    seoDescription: "",
    isPublished: true,
    publishedAt: "",
  });
  const [editingBlogId, setEditingBlogId] = useState<number | null>(null);

  const orderStatusOptions = ["paid", "processing", "completed", "cancelled", "refunded"];
  const settingsFields = [
    { key: "siteName", label: tx("Site name", "Ten website"), group: "branding" },
    { key: "logoUrl", label: tx("Logo URL", "Logo URL"), group: "branding" },
    { key: "footerTagline", label: tx("Footer tagline", "Mo ta footer"), group: "footer" },
    { key: "footerNote", label: tx("Footer note", "Ghi chu footer"), group: "footer" },
    { key: "contactEmail", label: tx("Contact email", "Email lien he"), group: "contact" },
    { key: "contactPhone", label: tx("Contact phone", "So dien thoai"), group: "contact" },
    { key: "contactAddress", label: tx("Contact address", "Dia chi"), group: "contact" },
    { key: "socialFacebook", label: tx("Facebook URL", "Facebook URL"), group: "social" },
    { key: "socialLinkedIn", label: tx("LinkedIn URL", "LinkedIn URL"), group: "social" },
    { key: "socialYoutube", label: tx("YouTube URL", "YouTube URL"), group: "social" },
  ];

  const sortedBlocks = useMemo(
    () => [...homeBlocks].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [homeBlocks]
  );
  const blockTypeOptions = useMemo(() => {
    const types = new Set<string>();
    homeBlocks.forEach((block) => {
      const value = (block.type ?? "").trim();
      if (value) types.add(value);
    });
    return Array.from(types).sort((a, b) => a.localeCompare(b));
  }, [homeBlocks]);
  const visibleBlocks = blockTypeFilter
    ? sortedBlocks.filter((block) => block.type === blockTypeFilter)
    : sortedBlocks;
  const canReorderBlocks = blockTypeFilter.length === 0 && !isReorderingBlocks;

  const filteredUsers = useMemo(() => {
    if (!userRoleFilter) return users;
    const normalized = userRoleFilter.toLowerCase();
    return users.filter((user) =>
      (user.roles ?? []).some((role) => role.toLowerCase() === normalized)
    );
  }, [users, userRoleFilter]);
  const sortedUsers = useMemo(
    () => [...filteredUsers].sort((a, b) => a.email.localeCompare(b.email)),
    [filteredUsers]
  );

  const filteredCourses = useMemo(() => {
    if (!courseFilter.trim()) return adminCourses;
    const q = courseFilter.trim().toLowerCase();
    return adminCourses.filter((course) =>
      [course.title, course.slug, course.category?.title]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(q))
    );
  }, [adminCourses, courseFilter]);

  const toDateTimeInput = (value?: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 16);
  };

  const loadUsers = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setUsers(await res.json());
      } else if (res.status === 401 || res.status === 403) {
        setNeedsAuth(true);
      }
    } catch {
      setApiOffline(true);
    }
  };

  const loadRoles = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = (await res.json()) as string[];
        setRoleOptions(data);
      }
    } catch {
      setApiOffline(true);
    }
  };

  const loadCategories = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setCategories(await res.json());
      }
    } catch {
      setApiOffline(true);
    }
  };

  const loadAdminCourses = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/instructor/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setAdminCourses(await res.json());
      }
    } catch {
      setApiOffline(true);
    }
  };

  const loadLearningPaths = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/learning-paths`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setLearningPaths(await res.json());
      }
    } catch {
      setApiOffline(true);
    }
  };

  const loadHomeBlocks = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/homepage/blocks`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setHomeBlocks(await res.json());
      }
    } catch {
      setApiOffline(true);
    }
  };

  const loadOrders = async (token: string, status?: string) => {
    try {
      const url = status ? `${API_URL}/api/admin/orders?status=${encodeURIComponent(status)}` : `${API_URL}/api/admin/orders`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setOrders(await res.json());
      }
    } catch {
      setApiOffline(true);
    }
  };

  const loadAuditLogs = async (token: string) => {
    try {
      const params = new URLSearchParams();
      if (auditQuery.trim()) params.set("query", auditQuery.trim());
      if (auditTake) params.set("take", String(auditTake));
      const url = `${API_URL}/api/admin/audit-logs${params.toString() ? `?${params}` : ""}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setAuditLogs(await res.json());
      }
    } catch {
      setApiOffline(true);
    }
  };

  const loadSystemSettings = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = (await res.json()) as SystemSettingDto[];
        const values: Record<string, string> = {};
        data.forEach((item) => {
          values[item.key] = item.value ?? "";
        });
        setSettingsValues(values);
      }
    } catch {
      setApiOffline(true);
    }
  };

  const loadReviews = async (token: string) => {
    try {
      const params = new URLSearchParams();
      if (reviewQuery.trim()) params.set("query", reviewQuery.trim());
      if (reviewCourseFilter) params.set("courseId", reviewCourseFilter);
      if (reviewTake) params.set("take", String(reviewTake));
      const url = `${API_URL}/api/admin/reviews${params.toString() ? `?${params}` : ""}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setReviews(await res.json());
      }
    } catch {
      setApiOffline(true);
    }
  };

  const loadSupportMessages = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/support/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = (await res.json()) as SupportMessageDto[];
        setSupportMessages(data);
        const notes: Record<number, string> = {};
        const statuses: Record<number, string> = {};
        data.forEach((item) => {
          notes[item.id] = item.adminNote ?? "";
          statuses[item.id] = item.status;
        });
        setSupportNotes(notes);
        setSupportStatus(statuses);
      }
    } catch {
      setApiOffline(true);
    }
  };

  const loadStats = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/stats/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setStats(await res.json());
      }
    } catch {
      setApiOffline(true);
    }
  };

  const loadBlogPosts = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/blog/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setBlogPosts(await res.json());
      }
    } catch {
      setApiOffline(true);
    }
  };

  const loadBlogPostDetail = async (token: string, id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/blog/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = (await res.json()) as BlogPostDetailDto;
        setEditingBlogId(data.id);
        setBlogForm({
          title: data.title,
          slug: data.slug,
          summary: data.summary,
          content: data.content,
          coverImageUrl: data.coverImageUrl ?? "",
          authorName: data.authorName ?? "",
          tags: (data.tags ?? []).join(", "),
          locale: data.locale ?? "en",
          seoTitle: data.seoTitle ?? "",
          seoDescription: data.seoDescription ?? "",
          isPublished: data.isPublished,
          publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString().slice(0, 16) : "",
        });
      }
    } catch {
      setApiOffline(true);
    }
  };

  const loadSupportReplies = async (token: string, id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/support/messages/${id}/replies`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = (await res.json()) as SupportReplyDto[];
        setSupportReplies((prev) => ({ ...prev, [id]: data }));
      }
    } catch {
      setApiOffline(true);
    }
  };

  const loadAll = async (token: string) => {
    setApiOffline(false);
    await Promise.all([
      loadStats(token),
      loadUsers(token),
      loadRoles(token),
      loadCategories(token),
      loadAdminCourses(token),
      loadLearningPaths(token),
      loadHomeBlocks(token),
      loadOrders(token),
      loadBlogPosts(token),
      loadSupportMessages(token),
      loadReviews(token),
      loadAuditLogs(token),
      loadSystemSettings(token),
    ]);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    loadAll(token);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    loadOrders(token, orderFilter);
  }, [orderFilter]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    loadAuditLogs(token);
  }, [auditQuery, auditTake]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    loadReviews(token);
  }, [reviewQuery, reviewTake, reviewCourseFilter]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    const connection = new HubConnectionBuilder()
      .withUrl(`${API_URL}/hubs/support`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on("support:message:new", (message: SupportMessageDto) => {
      setSupportMessages((prev) => {
        if (prev.some((item) => item.id === message.id)) {
          return prev;
        }
        return [message, ...prev];
      });
      setSupportNotes((prev) => ({ ...prev, [message.id]: message.adminNote ?? "" }));
      setSupportStatus((prev) => ({ ...prev, [message.id]: message.status }));
      notify({
        title: tx("New support message", "Tin nhan ho tro moi"),
        message: `${message.name}: ${message.message}`,
      });
    });

    connection.on("support:reply:new", (reply: SupportReplyDto) => {
      setSupportReplies((prev) => {
        const existing = prev[reply.supportMessageId] ?? [];
        return { ...prev, [reply.supportMessageId]: [...existing, reply] };
      });
      setSupportMessages((prev) =>
        prev.map((item) =>
          item.id === reply.supportMessageId
            ? { ...item, status: reply.authorRole === "admin" ? "answered" : "open" }
            : item
        )
      );
    });

    connection
      .start()
      .catch(() => {
        // ignore connection errors
      });

    return () => {
      connection.stop();
    };
  }, []);

  const pickPrimaryRole = (roles: string[]) => {
    if (roles.some((role) => role.toLowerCase() === "admin")) return "Admin";
    if (roles.some((role) => role.toLowerCase() === "instructor")) return "Instructor";
    return "User";
  };

  const handleUpdateUserRole = async (userId: string, role: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    const roles = ["User"];
    if (role && role !== "User") {
      roles.push(role);
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/roles`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roles }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, roles, isAdmin: roles.includes("Admin") } : user
          )
        );
        notify({
          title: tx("Roles updated", "Da cap nhat quyen"),
          message: tx("User roles saved.", "Da luu quyen nguoi dung."),
        });
      } else {
        notify({
          title: tx("Update failed", "Cap nhat that bai"),
          message: tx("Please try again later.", "Vui long thu lai."),
        });
      }
    } catch {
      setApiOffline(true);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    const status = (orderStatusDraft[orderId] ?? "").trim();
    if (!status) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        notify({
          title: tx("Order updated", "Da cap nhat don"),
          message: tx("Status saved.", "Da luu trang thai."),
        });
        loadOrders(token, orderFilter);
      } else {
        notify({
          title: tx("Update failed", "Cap nhat that bai"),
          message: tx("Please try again later.", "Vui long thu lai."),
        });
      }
    } catch {
      setApiOffline(true);
    }
  };

  const handleExportOrders = () => {
    const rows = [
      [
        "id",
        "status",
        "userEmail",
        "userName",
        "subtotal",
        "discountTotal",
        "total",
        "currency",
        "createdAt",
      ],
      ...orders.map((order) => [
        order.id,
        order.status,
        order.userEmail,
        order.userName,
        order.subtotal,
        order.discountTotal,
        order.total,
        order.currency,
        order.createdAt,
      ]),
    ];
    downloadCsvFile("orders.csv", rows);
  };

  const handleExportAuditLogs = () => {
    const rows = [
      ["id", "userEmail", "action", "path", "method", "ipAddress", "createdAt"],
      ...auditLogs.map((log) => [
        log.id,
        log.userEmail,
        log.action,
        log.path,
        log.method,
        log.ipAddress,
        log.createdAt,
      ]),
    ];
    downloadCsvFile("admin-audit-logs.csv", rows);
  };

  const handleSaveSettings = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    setSavingSettings(true);
    try {
      await Promise.all(
        settingsFields.map((field) =>
          fetch(`${API_URL}/api/admin/settings/${field.key}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ value: settingsValues[field.key] ?? "" }),
          })
        )
      );

      notify({
        title: tx("Settings saved", "Da luu cau hinh"),
        message: tx("System settings updated.", "Da cap nhat cau hinh he thong."),
      });
      loadSystemSettings(token);
    } catch {
      setApiOffline(true);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleClearCache = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/cache/clear`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        notify({
          title: tx("Cache cleared", "Da xoa cache"),
          message: tx("Cache version bumped.", "Da cap nhat cache."),
        });
      } else {
        notify({
          title: tx("Clear failed", "Xoa cache that bai"),
          message: tx("Please try again later.", "Vui long thu lai."),
        });
      }
    } catch {
      setApiOffline(true);
    }
  };

  const updateBlockSortOrders = async (orderedBlocks: HomePageBlockDto[]) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    setIsReorderingBlocks(true);
    try {
      const payloads = orderedBlocks.map((block) => ({
        id: block.id,
        body: {
          key: block.key ?? "",
          type: block.type ?? "",
          title: block.title ?? "",
          subtitle: block.subtitle ?? "",
          imageUrl: block.imageUrl ?? "",
          ctaText: block.ctaText ?? "",
          ctaUrl: block.ctaUrl ?? "",
          itemsJson: block.itemsJson ?? "",
          locale: block.locale ?? "",
          sortOrder: block.sortOrder ?? 0,
          isPublished: block.isPublished ?? false,
        },
      }));

      await Promise.all(
        payloads.map((item) =>
          fetch(`${API_URL}/api/admin/homepage/blocks/${item.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(item.body),
          })
        )
      );

      notify({
        title: tx("Order updated", "Da sap xep"),
        message: tx("Block order saved.", "Da luu thu tu block."),
      });
      loadHomeBlocks(token);
    } catch {
      setApiOffline(true);
    } finally {
      setIsReorderingBlocks(false);
    }
  };

  const handleReorderBlocks = async (fromId: number, toId: number) => {
    if (fromId === toId) return;
    const fromIndex = sortedBlocks.findIndex((block) => block.id === fromId);
    const toIndex = sortedBlocks.findIndex((block) => block.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;

    const next = [...sortedBlocks];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);

    const updated = next.map((block, index) => ({
      ...block,
      sortOrder: index + 1,
    }));

    setHomeBlocks(updated);
    await updateBlockSortOrders(updated);
  };

  const handleCreateCategory = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    if (!newCategory.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newCategory.trim() }),
      });

      if (res.ok) {
        notify({
          title: tx("Category created", "Da tao danh muc"),
          message: tx("New category added.", "Da them danh muc moi."),
        });
        setNewCategory("");
        loadCategories(token);
      } else {
        notify({
          title: tx("Create failed", "Tao that bai"),
          message: tx("Category already exists.", "Danh muc da ton tai."),
        });
      }
    } catch {
      setApiOffline(true);
    }
  };

  const handleUpdateCategory = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: editingTitle.trim() }),
      });

      if (res.ok) {
        notify({
          title: tx("Category updated", "Da cap nhat danh muc"),
          message: tx("Changes saved.", "Da luu thay doi."),
        });
        setEditingId(null);
        setEditingTitle("");
        loadCategories(token);
      } else {
        notify({
          title: tx("Update failed", "Cap nhat that bai"),
          message: tx("Slug already exists.", "Slug da ton tai."),
        });
      }
    } catch {
      setApiOffline(true);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        notify({
          title: tx("Category removed", "Da xoa danh muc"),
          message: tx("Category deleted.", "Danh muc da duoc xoa."),
        });
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
      } else {
        notify({
          title: tx("Delete failed", "Xoa that bai"),
          message: tx("Category has courses.", "Danh muc dang co khoa hoc."),
        });
      }
    } catch {
      setApiOffline(true);
    }
  };

  const handleExportCategories = () => {
    const rows = [["title"], ...categories.map((category) => [category.title])];
    downloadCsvFile("categories.csv", rows);
  };

  const handleImportCategories = async (file: File) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length < 2) return;
      const header = rows[0].map((cell) => cell.trim().toLowerCase());
      const titleIndex = header.indexOf("title");
      if (titleIndex === -1) return;

      const titles = rows
        .slice(1)
        .map((row) => row[titleIndex]?.trim())
        .filter((value) => value && value.length > 0);

      await Promise.all(
        titles.map((title) =>
          fetch(`${API_URL}/api/admin/categories`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title }),
          })
        )
      );

      notify({
        title: tx("Import done", "Da nhap danh muc"),
        message: tx("Categories imported.", "Danh muc da duoc nhap."),
      });
      loadCategories(token);
    } catch {
      setApiOffline(true);
    }
  };

  const resetCourseForm = () => {
    setCourseForm({
      title: "",
      categoryId: "",
      shortDescription: "",
      description: "",
      outcome: "",
      requirements: "",
      language: "English",
      price: 0,
      flashSalePrice: "",
      flashSaleStartsAt: "",
      flashSaleEndsAt: "",
      level: "Beginner",
      previewVideoUrl: "",
      isPublished: true,
    });
    setCourseThumbnail(null);
    setEditingCourseId(null);
  };

  const handleEditCourse = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/instructor/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = (await res.json()) as CourseDetailAdminDto;
        setEditingCourseId(data.id);
        setCourseThumbnail(null);
        setCourseForm({
          title: data.title ?? "",
          categoryId: data.category?.id ? String(data.category.id) : "",
          shortDescription: data.shortDescription ?? "",
          description: data.description ?? "",
          outcome: data.outcome ?? "",
          requirements: data.requirements ?? "",
          language: data.language ?? "English",
          price: data.price ?? 0,
          flashSalePrice: data.flashSalePrice != null ? String(data.flashSalePrice) : "",
          flashSaleStartsAt: toDateTimeInput(data.flashSaleStartsAt),
          flashSaleEndsAt: toDateTimeInput(data.flashSaleEndsAt),
          level: data.level ?? "Beginner",
          previewVideoUrl: data.previewVideoUrl ?? "",
          isPublished: data.isPublished ?? true,
        });
      }
    } catch {
      setApiOffline(true);
    }
  };

  const handleSaveCourse = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    if (!courseForm.title.trim() || !courseForm.shortDescription.trim() || !courseForm.description.trim()) {
      notify({
        title: tx("Missing fields", "Thieu thong tin"),
        message: tx("Please fill title, short description, and description.", "Can nhap tieu de, tom tat, mo ta."),
      });
      return;
    }

    if (!courseForm.outcome.trim() || !courseForm.requirements.trim()) {
      notify({
        title: tx("Missing fields", "Thieu thong tin"),
        message: tx("Outcome and requirements are required.", "Can nhap ket qua va yeu cau."),
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", courseForm.title.trim());
    formData.append("shortDescription", courseForm.shortDescription.trim());
    formData.append("description", courseForm.description.trim());
    formData.append("outcome", courseForm.outcome.trim());
    formData.append("requirements", courseForm.requirements.trim());
    formData.append("language", courseForm.language.trim() || "English");
    formData.append("price", String(courseForm.price || 0));
    formData.append("level", courseForm.level.trim() || "Beginner");
    formData.append("previewVideoUrl", courseForm.previewVideoUrl.trim());
    formData.append("isPublished", String(courseForm.isPublished));

    if (courseForm.categoryId) {
      formData.append("categoryId", courseForm.categoryId);
    }

    if (courseForm.flashSalePrice) {
      formData.append("flashSalePrice", courseForm.flashSalePrice);
    }

    if (courseForm.flashSaleStartsAt) {
      const start = new Date(courseForm.flashSaleStartsAt);
      if (!Number.isNaN(start.getTime())) {
        formData.append("flashSaleStartsAt", start.toISOString());
      }
    }

    if (courseForm.flashSaleEndsAt) {
      const end = new Date(courseForm.flashSaleEndsAt);
      if (!Number.isNaN(end.getTime())) {
        formData.append("flashSaleEndsAt", end.toISOString());
      }
    }

    if (courseThumbnail) {
      formData.append("thumbnail", courseThumbnail);
    }

    const isEditing = Boolean(editingCourseId);
    const url = isEditing ? `${API_URL}/api/courses/${editingCourseId}` : `${API_URL}/api/courses`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        notify({
          title: isEditing ? tx("Course updated", "Da cap nhat khoa hoc") : tx("Course created", "Da tao khoa hoc"),
          message: tx("Changes saved.", "Da luu thay doi."),
        });
        resetCourseForm();
        loadAdminCourses(token);
      } else {
        const message = await res.text();
        notify({
          title: tx("Save failed", "Luu that bai"),
          message: message || tx("Please try again.", "Vui long thu lai."),
        });
      }
    } catch {
      setApiOffline(true);
    }
  };

  const handleDeleteCourse = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/courses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        notify({
          title: tx("Course deleted", "Da xoa khoa hoc"),
          message: tx("Course removed.", "Da xoa khoa hoc."),
        });
        setAdminCourses((prev) => prev.filter((course) => course.id !== id));
      } else {
        notify({
          title: tx("Delete failed", "Xoa that bai"),
          message: tx("Please try again later.", "Vui long thu lai."),
        });
      }
    } catch {
      setApiOffline(true);
    }
  };

  const handleExportCourses = () => {
    const rows = [
      ["id", "title", "slug", "price", "level", "language", "categorySlug", "isPublished"],
      ...adminCourses.map((course) => [
        course.id,
        course.title,
        course.slug,
        course.price,
        course.level,
        course.language,
        course.category?.slug ?? "",
        course.isPublished ? "true" : "false",
      ]),
    ];
    downloadCsvFile("courses.csv", rows);
  };

  const handleImportCourses = async (file: File) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    setImportingCourses(true);
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length < 2) {
        return;
      }

      const header = rows[0].map((cell) => cell.trim().toLowerCase());
      const getValue = (row: string[], key: string) => {
        const index = header.indexOf(key);
        if (index === -1) return "";
        return row[index] ?? "";
      };

      const resolveCategoryId = (row: string[]) => {
        const slug = getValue(row, "categoryslug");
        const title = getValue(row, "categorytitle") || getValue(row, "category");
        if (slug) {
          const match = categories.find((cat) => cat.slug.toLowerCase() === slug.toLowerCase());
          if (match) return String(match.id);
        }
        if (title) {
          const match = categories.find((cat) => cat.title.toLowerCase() === title.toLowerCase());
          if (match) return String(match.id);
        }
        return "";
      };

      let created = 0;
      for (const row of rows.slice(1)) {
        if (row.every((cell) => !cell.trim())) continue;
        const title = getValue(row, "title");
        const shortDescription = getValue(row, "shortdescription") || getValue(row, "short_description");
        const description = getValue(row, "description");
        const outcome = getValue(row, "outcome");
        const requirements = getValue(row, "requirements");
        if (!title || !shortDescription || !description || !outcome || !requirements) {
          continue;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("shortDescription", shortDescription);
        formData.append("description", description);
        formData.append("outcome", outcome);
        formData.append("requirements", requirements);
        formData.append("language", getValue(row, "language") || "English");
        formData.append("price", getValue(row, "price") || "0");
        formData.append("level", getValue(row, "level") || "Beginner");
        formData.append("previewVideoUrl", getValue(row, "previewvideourl"));

        const categoryId = resolveCategoryId(row);
        if (categoryId) {
          formData.append("categoryId", categoryId);
        }

        const isPublished = getValue(row, "ispublished");
        if (isPublished) {
          formData.append("isPublished", isPublished.toLowerCase() === "true" ? "true" : "false");
        }

        const flashSalePrice = getValue(row, "flashsaleprice");
        if (flashSalePrice) {
          formData.append("flashSalePrice", flashSalePrice);
        }

        const flashSaleStartsAt = getValue(row, "flashsalestartsat");
        if (flashSaleStartsAt) {
          const start = new Date(flashSaleStartsAt);
          if (!Number.isNaN(start.getTime())) {
            formData.append("flashSaleStartsAt", start.toISOString());
          }
        }

        const flashSaleEndsAt = getValue(row, "flashsaleendsat");
        if (flashSaleEndsAt) {
          const end = new Date(flashSaleEndsAt);
          if (!Number.isNaN(end.getTime())) {
            formData.append("flashSaleEndsAt", end.toISOString());
          }
        }

        const res = await fetch(`${API_URL}/api/courses`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (res.ok) {
          created += 1;
        }
      }

      notify({
        title: tx("Import finished", "Nhap hoan tat"),
        message: tx(`Created ${created} courses.`, `Da tao ${created} khoa hoc.`),
      });
      loadAdminCourses(token);
    } catch {
      setApiOffline(true);
    } finally {
      setImportingCourses(false);
    }
  };

  const resetPathForm = () => {
    setPathForm({
      title: "",
      description: "",
      level: "Beginner",
      thumbnailUrl: "",
      estimatedHours: 0,
      isPublished: true,
    });
    setEditingPathId(null);
  };

  const handleSavePath = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    if (!pathForm.title.trim()) return;

    const payload = {
      title: pathForm.title.trim(),
      description: pathForm.description.trim(),
      level: pathForm.level.trim(),
      thumbnailUrl: pathForm.thumbnailUrl.trim(),
      estimatedHours: Number(pathForm.estimatedHours) || 0,
      isPublished: pathForm.isPublished,
    };

    try {
      const res = await fetch(
        `${API_URL}/api/admin/learning-paths${editingPathId ? `/${editingPathId}` : ""}`,
        {
          method: editingPathId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        notify({
          title: editingPathId ? tx("Path updated", "Da cap nhat lo trinh") : tx("Path created", "Da tao lo trinh"),
          message: tx("Changes saved.", "Da luu thay doi."),
        });
        resetPathForm();
        loadLearningPaths(token);
      } else {
        notify({
          title: tx("Save failed", "Luu that bai"),
          message: tx("Please check the slug or required fields.", "Kiem tra lai tieu de va slug."),
        });
      }
    } catch {
      setApiOffline(true);
    }
  };

  const handleEditPath = (path: LearningPathDto) => {
    setEditingPathId(path.id);
    setPathForm({
      title: path.title,
      description: path.description,
      level: path.level,
      thumbnailUrl: path.thumbnailUrl,
      estimatedHours: path.estimatedHours,
      isPublished: path.isPublished,
    });
  };

  const handleDeletePath = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/learning-paths/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        notify({
          title: tx("Path removed", "Da xoa lo trinh"),
          message: tx("Learning path deleted.", "Da xoa lo trinh."),
        });
        setLearningPaths((prev) => prev.filter((item) => item.id !== id));
      } else {
        notify({
          title: tx("Delete failed", "Xoa that bai"),
          message: tx("Try again later.", "Thu lai sau."),
        });
      }
    } catch {
      setApiOffline(true);
    }
  };

  const handleExportPaths = () => {
    const rows = [
      ["title", "description", "level", "thumbnailUrl", "estimatedHours", "isPublished"],
      ...learningPaths.map((path) => [
        path.title,
        path.description,
        path.level,
        path.thumbnailUrl,
        path.estimatedHours,
        path.isPublished ? "true" : "false",
      ]),
    ];
    downloadCsvFile("learning-paths.csv", rows);
  };

  const handleImportPaths = async (file: File) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length < 2) return;
      const header = rows[0].map((cell) => cell.trim().toLowerCase());
      const getValue = (row: string[], key: string) => {
        const index = header.indexOf(key);
        if (index === -1) return "";
        return row[index] ?? "";
      };

      let created = 0;
      for (const row of rows.slice(1)) {
        if (row.every((cell) => !cell.trim())) continue;
        const title = getValue(row, "title");
        if (!title) continue;
        const payload = {
          title,
          description: getValue(row, "description"),
          level: getValue(row, "level") || "Beginner",
          thumbnailUrl: getValue(row, "thumbnailurl"),
          estimatedHours: Number(getValue(row, "estimatedhours") || 0),
          isPublished: (getValue(row, "ispublished") || "true").toLowerCase() === "true",
        };

        const res = await fetch(`${API_URL}/api/admin/learning-paths`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          created += 1;
        }
      }

      notify({
        title: tx("Import finished", "Nhap hoan tat"),
        message: tx(`Created ${created} paths.`, `Da tao ${created} lo trinh.`),
      });
      loadLearningPaths(token);
    } catch {
      setApiOffline(true);
    }
  };

  const resetBlockForm = () => {
    setBlockForm({
      key: "",
      type: "hero",
      title: "",
      subtitle: "",
      imageUrl: "",
      ctaText: "",
      ctaUrl: "",
      itemsJson: "",
      locale: "",
      sortOrder: 1,
      isPublished: true,
    });
    setEditingBlockId(null);
  };

  const handleSaveBlock = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    if (!blockForm.type.trim()) return;

    const payload = {
      key: blockForm.key.trim(),
      type: blockForm.type.trim(),
      title: blockForm.title.trim(),
      subtitle: blockForm.subtitle.trim(),
      imageUrl: blockForm.imageUrl.trim(),
      ctaText: blockForm.ctaText.trim(),
      ctaUrl: blockForm.ctaUrl.trim(),
      itemsJson: blockForm.itemsJson.trim(),
      locale: blockForm.locale.trim(),
      sortOrder: Number(blockForm.sortOrder) || 0,
      isPublished: blockForm.isPublished,
    };

    try {
      const res = await fetch(
        `${API_URL}/api/admin/homepage/blocks${editingBlockId ? `/${editingBlockId}` : ""}`,
        {
          method: editingBlockId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        notify({
          title: editingBlockId ? tx("Block updated", "Da cap nhat block") : tx("Block created", "Da tao block"),
          message: tx("Changes saved.", "Da luu thay doi."),
        });
        resetBlockForm();
        loadHomeBlocks(token);
      } else {
        notify({
          title: tx("Save failed", "Luu that bai"),
          message: tx("Please check the required fields.", "Kiem tra lai thong tin."),
        });
      }
    } catch {
      setApiOffline(true);
    }
  };

  const handleEditBlock = (block: HomePageBlockDto) => {
    setEditingBlockId(block.id);
    setBlockForm({
      key: block.key,
      type: block.type,
      title: block.title,
      subtitle: block.subtitle,
      imageUrl: block.imageUrl,
      ctaText: block.ctaText,
      ctaUrl: block.ctaUrl,
      itemsJson: block.itemsJson,
      locale: block.locale,
      sortOrder: block.sortOrder,
      isPublished: block.isPublished,
    });
  };

  const handleDeleteBlock = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/homepage/blocks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        notify({
          title: tx("Block removed", "Da xoa block"),
          message: tx("Block deleted.", "Da xoa block."),
        });
        setHomeBlocks((prev) => prev.filter((item) => item.id !== id));
      } else {
        notify({
          title: tx("Delete failed", "Xoa that bai"),
          message: tx("Try again later.", "Thu lai sau."),
        });
      }
    } catch {
      setApiOffline(true);
    }
  };

  const resetBlogForm = () => {
    setBlogForm({
      title: "",
      slug: "",
      summary: "",
      content: "",
      coverImageUrl: "",
      authorName: "",
      tags: "",
      locale: "en",
      seoTitle: "",
      seoDescription: "",
      isPublished: true,
      publishedAt: "",
    });
    setEditingBlogId(null);
  };

  const handleSaveBlog = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    if (!blogForm.title.trim()) return;

    const publishedAt = blogForm.publishedAt
      ? new Date(blogForm.publishedAt).toISOString()
      : null;

    const payload = {
      title: blogForm.title.trim(),
      slug: blogForm.slug.trim(),
      summary: blogForm.summary.trim(),
      content: blogForm.content.trim(),
      coverImageUrl: blogForm.coverImageUrl.trim(),
      authorName: blogForm.authorName.trim(),
      tags: blogForm.tags.trim(),
      locale: blogForm.locale.trim(),
      seoTitle: blogForm.seoTitle.trim(),
      seoDescription: blogForm.seoDescription.trim(),
      isPublished: blogForm.isPublished,
      publishedAt,
    };

    try {
      const res = await fetch(
        `${API_URL}/api/admin/blog/posts${editingBlogId ? `/${editingBlogId}` : ""}`,
        {
          method: editingBlogId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        notify({
          title: editingBlogId ? tx("Blog updated", "Da cap nhat bai viet") : tx("Blog created", "Da tao bai viet"),
          message: tx("Changes saved.", "Da luu thay doi."),
        });
        resetBlogForm();
        loadBlogPosts(token);
      } else {
        notify({
          title: tx("Save failed", "Luu that bai"),
          message: tx("Please check required fields or slug.", "Kiem tra thong tin va slug."),
        });
      }
    } catch {
      setApiOffline(true);
    }
  };

  const handleEditBlog = (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    loadBlogPostDetail(token, id);
  };

  const handleDeleteBlog = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/blog/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        notify({
          title: tx("Blog removed", "Da xoa bai viet"),
          message: tx("Blog post deleted.", "Da xoa bai viet."),
        });
        setBlogPosts((prev) => prev.filter((item) => item.id !== id));
      }
    } catch {
      setApiOffline(true);
    }
  };

  const handleDeleteReview = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        notify({
          title: tx("Review removed", "Da xoa danh gia"),
          message: tx("Review deleted.", "Da xoa danh gia."),
        });
        setReviews((prev) => prev.filter((review) => review.id !== id));
      } else {
        notify({
          title: tx("Delete failed", "Xoa that bai"),
          message: tx("Please try again later.", "Vui long thu lai."),
        });
      }
    } catch {
      setApiOffline(true);
    }
  };

  const handleUpdateSupport = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    const payload = {
      status: supportStatus[id] ?? "open",
      adminNote: supportNotes[id] ?? "",
    };

    try {
      const res = await fetch(`${API_URL}/api/admin/support/messages/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        notify({
          title: tx("Support updated", "Da cap nhat ho tro"),
          message: tx("Changes saved.", "Da luu thay doi."),
        });
        loadSupportMessages(token);
      }
    } catch {
      setApiOffline(true);
    }
  };

  const handleReplySupport = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    const message = supportReplyDraft[id]?.trim() ?? "";
    if (!message) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/support/messages/${id}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

      if (res.ok) {
        setSupportReplyDraft((prev) => ({ ...prev, [id]: "" }));
        await loadSupportReplies(token, id);
        await loadSupportMessages(token);
      }
    } catch {
      setApiOffline(true);
    }
  };

  if (needsAuth) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-16 fade-in">
        <div className="glass-card rounded-3xl p-10 text-center">
          <p className="text-sm text-gray-600">
            {tx("Admin access only.", "Chi danh cho quan tri vien.")}
          </p>
          <Link
            href="/login?next=/admin"
            className="mt-4 inline-flex rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white"
          >
            {tx("Sign in", "Dang nhap")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-6 py-12 fade-in">
      <div className="space-y-2">
        <Link href="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
          {tx("Home", "Trang chu")}
        </Link>
        <h1 className="section-title text-4xl font-semibold text-gray-900">
          {tx("Admin console", "Bang quan tri")}
        </h1>
        <p className="text-sm text-gray-600">
          {tx("Manage categories and user access.", "Quan ly danh muc va quyen truy cap nguoi dung.")}
        </p>
      </div>

      {stats && (
        <section className="glass-card space-y-6 rounded-3xl p-8">
          <div>
            <h2 className="section-title text-2xl font-semibold text-gray-900">
              {tx("Overview", "Tong quan")}
            </h2>
            <p className="text-sm text-gray-600">
              {tx("Key system metrics.", "Chi so tong quan he thong.")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white/70 p-4">
              <p className="text-xs font-semibold text-blue-600">{tx("Users", "Nguoi dung")}</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white/70 p-4">
              <p className="text-xs font-semibold text-blue-600">{tx("Courses", "Khoa hoc")}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.publishedCourses}/{stats.totalCourses}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white/70 p-4">
              <p className="text-xs font-semibold text-blue-600">{tx("Enrollments", "Ghi danh")}</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalEnrollments}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white/70 p-4">
              <p className="text-xs font-semibold text-blue-600">{tx("Lessons", "Bai hoc")}</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalLessons}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white/70 p-4">
              <p className="text-xs font-semibold text-blue-600">{tx("Revenue", "Doanh thu")}</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${stats.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white/70 p-4">
              <p className="text-xs font-semibold text-blue-600">{tx("Avg rating", "Danh gia TB")}</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.averageRating.toFixed(1)}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white/70 p-4">
              <p className="text-xs font-semibold text-blue-600">{tx("Active 30d", "Hoat dong 30 ngay")}</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeStudents30d}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white/70 p-4">
              <p className="text-xs font-semibold text-blue-600">{tx("Open support", "Ho tro dang mo")}</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.openSupportTickets}</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
              {tx("Enrollments last 7 days", "Ghi danh 7 ngay")}
            </p>
            <div className="flex items-end gap-3">
              {(() => {
                const max = Math.max(1, ...stats.enrollmentsLast7Days.map((d) => d.count));
                return stats.enrollmentsLast7Days.map((item) => (
                  <div key={item.date} className="flex flex-col items-center gap-2">
                    <div className="flex h-20 items-end">
                      <div
                        className="w-3 rounded-full bg-blue-600"
                        style={{ height: `${Math.round((item.count / max) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-600">{item.date.slice(5)}</span>
                  </div>
                ));
              })()}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                {tx("Revenue last 30 days", "Doanh thu 30 ngay")}
              </p>
              <div className="flex items-end gap-1">
                {(() => {
                  const revenueSeries = stats.revenueLast30Days ?? [];
                  const max = Math.max(1, ...revenueSeries.map((d) => d.value));
                  return revenueSeries.map((item) => (
                    <div key={item.date} className="flex flex-col items-center gap-2">
                      <div className="flex h-24 items-end">
                        <div
                          className="w-2 rounded-full bg-blue-600"
                          style={{ height: `${Math.round((item.value / max) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-600">{item.date.slice(5)}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                  {tx("Orders by status", "Don hang theo trang thai")}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(stats.ordersByStatus ?? []).map((item) => (
                    <span
                      key={item.status}
                      className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-900"
                    >
                      {item.status}: {item.count}
                    </span>
                  ))}
                  {(stats.ordersByStatus ?? []).length === 0 && (
                    <span className="text-xs text-gray-600">
                      {tx("No orders yet.", "Chua co don hang.")}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                  {tx("Top courses by revenue", "Khoa hoc doanh thu cao")}
                </p>
                <div className="mt-3 space-y-2">
                  {(stats.topCoursesByRevenue ?? []).map((course) => (
                    <div key={course.courseId} className="flex items-center justify-between text-xs text-gray-900">
                      <span className="font-semibold">{course.courseTitle}</span>
                      <span className="text-gray-600">
                        {course.orders} {tx("orders", "don")} � ${course.revenue.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {(stats.topCoursesByRevenue ?? []).length === 0 && (
                    <span className="text-xs text-gray-600">
                      {tx("No revenue data yet.", "Chua co du lieu doanh thu.")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {apiOffline && (
        <section className="glass-card space-y-3 rounded-3xl border border-amber-200 bg-amber-50/80 p-6">
          <h2 className="text-base font-semibold text-amber-900">
            {tx("API is offline", "API dang tat")}
          </h2>
          <p className="text-sm text-amber-900/80">
            {tx(
              "We cannot reach the API at " + API_URL + ". Please start the backend and retry.",
              "Khong ket noi duoc API tai " + API_URL + ". Hay bat backend va thu lai."
            )}
          </p>
          <button
            type="button"
            onClick={() => {
              const token = localStorage.getItem("token");
              if (!token) {
                setNeedsAuth(true);
                return;
              }
              loadAll(token);
            }}
            className="w-fit rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold text-white"
          >
            {tx("Retry", "Thu lai")}
          </button>
        </section>
      )}

      <section className="glass-card space-y-6 rounded-3xl p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="section-title text-2xl font-semibold text-gray-900">
              {tx("System settings", "Cau hinh he thong")}
            </h2>
            <p className="text-sm text-gray-600">
              {tx("Control branding, footer, and contact details.", "Chinh sua logo, footer va lien he.")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleClearCache}
              className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-900"
            >
              {tx("Clear cache", "Xoa cache")}
            </button>
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white"
            >
              {savingSettings ? tx("Saving...", "Dang luu...") : tx("Save settings", "Luu cau hinh")}
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {settingsFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                {field.label}
              </label>
              <input
                value={settingsValues[field.key] ?? ""}
                onChange={(e) =>
                  setSettingsValues((prev) => ({ ...prev, [field.key]: e.currentTarget.value }))
                }
                placeholder={field.key}
                className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="surface-card space-y-6 rounded-3xl p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="section-title text-2xl font-semibold text-gray-900">
              {tx("Courses", "Khoa hoc")}
            </h2>
            <p className="text-sm text-gray-600">
              {tx("Manage the product catalog.", "Quan ly khoa hoc trong catalog.")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.currentTarget.value)}
              placeholder={tx("Search courses", "Tim khoa hoc")}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs"
            />
            <button
              type="button"
              onClick={handleExportCourses}
              className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-900"
            >
              {tx("Export CSV", "Xuat CSV")}
            </button>
            <label className="cursor-pointer rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-900">
              {importingCourses ? tx("Importing...", "Dang nhap...") : tx("Import CSV", "Nhap CSV")}
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                disabled={importingCourses}
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0];
                  if (file) {
                    handleImportCourses(file);
                  }
                  e.currentTarget.value = "";
                }}
              />
            </label>
            <button
              type="button"
              onClick={() =>
                downloadCsvFile("courses-template.csv", [
                  [
                    "title",
                    "shortDescription",
                    "description",
                    "outcome",
                    "requirements",
                    "language",
                    "price",
                    "level",
                    "categorySlug",
                    "isPublished",
                    "previewVideoUrl",
                    "flashSalePrice",
                    "flashSaleStartsAt",
                    "flashSaleEndsAt",
                  ],
                  [
                    "Frontend Fundamentals",
                    "Learn core web UI skills",
                    "Full description here",
                    "Build 3 real projects",
                    "Basic HTML/CSS",
                    "English",
                    "129",
                    "Beginner",
                    "frontend",
                    "true",
                    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    "99",
                    "2026-04-03T09:00:00Z",
                    "2026-04-10T09:00:00Z",
                  ],
                ])
              }
              className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-900"
            >
              {tx("Template", "Mau CSV")}
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <input
              value={courseForm.title}
              onChange={(e) => setCourseForm((prev) => ({ ...prev, title: e.currentTarget.value }))}
              placeholder={tx("Title", "Tieu de")}
              className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
            />
            <select
              value={courseForm.categoryId}
              onChange={(e) => setCourseForm((prev) => ({ ...prev, categoryId: e.currentTarget.value }))}
              className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
            >
              <option value="">{tx("No category", "Chua chon danh muc")}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
            <input
              value={courseForm.shortDescription}
              onChange={(e) => setCourseForm((prev) => ({ ...prev, shortDescription: e.currentTarget.value }))}
              placeholder={tx("Short description", "Mo ta ngan")}
              className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
            />
            <textarea
              value={courseForm.description}
              onChange={(e) => setCourseForm((prev) => ({ ...prev, description: e.currentTarget.value }))}
              placeholder={tx("Full description", "Mo ta day du")}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm"
              rows={4}
            />
            <textarea
              value={courseForm.outcome}
              onChange={(e) => setCourseForm((prev) => ({ ...prev, outcome: e.currentTarget.value }))}
              placeholder={tx("Learning outcome", "Ket qua khoa hoc")}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm"
              rows={2}
            />
            <textarea
              value={courseForm.requirements}
              onChange={(e) => setCourseForm((prev) => ({ ...prev, requirements: e.currentTarget.value }))}
              placeholder={tx("Requirements", "Yeu cau")}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm"
              rows={2}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={courseForm.language}
                onChange={(e) => setCourseForm((prev) => ({ ...prev, language: e.currentTarget.value }))}
                placeholder={tx("Language", "Ngon ngu")}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
              />
              <input
                value={courseForm.level}
                onChange={(e) => setCourseForm((prev) => ({ ...prev, level: e.currentTarget.value }))}
                placeholder={tx("Level", "Cap do")}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="number"
                value={courseForm.price}
                onChange={(e) => setCourseForm((prev) => ({ ...prev, price: Number(e.currentTarget.value) }))}
                placeholder={tx("Price", "Gia")}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
              />
              <input
                value={courseForm.flashSalePrice}
                onChange={(e) => setCourseForm((prev) => ({ ...prev, flashSalePrice: e.currentTarget.value }))}
                placeholder={tx("Flash sale price", "Gia khuyen mai")}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="datetime-local"
                value={courseForm.flashSaleStartsAt}
                onChange={(e) => setCourseForm((prev) => ({ ...prev, flashSaleStartsAt: e.currentTarget.value }))}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
              />
              <input
                type="datetime-local"
                value={courseForm.flashSaleEndsAt}
                onChange={(e) => setCourseForm((prev) => ({ ...prev, flashSaleEndsAt: e.currentTarget.value }))}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
              />
            </div>
            <input
              value={courseForm.previewVideoUrl}
              onChange={(e) => setCourseForm((prev) => ({ ...prev, previewVideoUrl: e.currentTarget.value }))}
              placeholder={tx("Preview video URL", "Link video preview")}
              className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-900">
              <input
                type="checkbox"
                checked={courseForm.isPublished}
                onChange={(e) => setCourseForm((prev) => ({ ...prev, isPublished: e.currentTarget.checked }))}
              />
              {tx("Published", "Xuat ban")}
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <label className="cursor-pointer rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-900">
                {courseThumbnail ? courseThumbnail.name : tx("Upload thumbnail", "Tai thumbnail")}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setCourseThumbnail(e.currentTarget.files?.[0] ?? null)}
                />
              </label>
              <button
                type="button"
                onClick={handleSaveCourse}
                className="rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white"
              >
                {editingCourseId ? tx("Save changes", "Luu thay doi") : tx("Add course", "Them khoa hoc")}
              </button>
              {editingCourseId && (
                <button
                  type="button"
                  onClick={resetCourseForm}
                  className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-900"
                >
                  {tx("Cancel", "Huy")}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {filteredCourses.map((course) => (
              <div key={course.id} className="flex flex-col gap-3 rounded-2xl bg-white/70 p-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{course.title}</p>
                  <p className="text-xs text-gray-600">
                    {course.category?.title ?? tx("No category", "Chua co danh muc")} � {course.level} �{" "}
                    {course.language}
                  </p>
                  <p className="text-xs text-gray-600">Slug: {course.slug}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-gray-600">
                  <span>${course.price.toFixed(2)}</span>
                  <span>{course.isPublished ? tx("Published", "Xuat ban") : tx("Draft", "Ban nhap")}</span>
                  <span>{new Date(course.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditCourse(course.id)}
                    className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-900"
                  >
                    {tx("Edit", "Sua")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCourse(course.id)}
                    className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-900"
                  >
                    {tx("Delete", "Xoa")}
                  </button>
                </div>
              </div>
            ))}
            {filteredCourses.length === 0 && (
              <p className="text-sm text-gray-600">{tx("No courses yet.", "Chua co khoa hoc.")}</p>
            )}
          </div>
        </div>
      </section>

      <section className="glass-card space-y-6 rounded-3xl p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="section-title text-2xl font-semibold text-gray-900">
              {tx("Orders", "Don hang")}
            </h2>
            <p className="text-sm text-gray-600">
              {tx("Track payments and fulfillment status.", "Theo doi thanh toan va trang thai xu ly.")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={orderFilter}
              onChange={(e) => setOrderFilter(e.currentTarget?.value ?? "")}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-900"
            >
              <option value="">{tx("All statuses", "Tat ca trang thai")}</option>
              {orderStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleExportOrders}
              className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-900"
            >
              {tx("Export CSV", "Xuat CSV")}
            </button>
          </div>
        </div>

        <datalist id="order-status-options">
          {orderStatusOptions.map((status) => (
            <option key={status} value={status} />
          ))}
        </datalist>

        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="flex flex-col gap-3 rounded-2xl bg-white/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    #{order.id} � {order.userName}
                  </p>
                  <p className="text-xs text-gray-600">{order.userEmail}</p>
                </div>
                <div className="text-xs font-semibold text-gray-600">
                  {formatCurrency(order.total, order.currency || "USD")}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={orderStatusDraft[order.id] ?? order.status}
                  onChange={(e) => {
                    const value = e.currentTarget?.value ?? "";
                    setOrderStatusDraft((prev) => ({ ...prev, [order.id]: value }));
                  }}
                  list="order-status-options"
                  placeholder={tx("Status", "Trang thai")}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleUpdateOrderStatus(order.id)}
                  className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-900"
                >
                  {tx("Update status", "Cap nhat trang thai")}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setOrderExpanded((prev) => ({ ...prev, [order.id]: !prev[order.id] }))
                  }
                  className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-900"
                >
                  {orderExpanded[order.id] ? tx("Hide items", "An muc") : tx("View items", "Xem muc")}
                </button>
                <span className="text-[11px] text-gray-600">
                  {tx("Updated", "Cap nhat")}: {new Date(order.updatedAt).toLocaleString()}
                </span>
              </div>

              {orderExpanded[order.id] && (
                <div className="space-y-2 rounded-2xl border border-gray-200 bg-white/70 p-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-900">
                      <span>{item.courseTitle}</span>
                      <span>
                        {item.quantity} x {formatCurrency(item.unitPrice, order.currency || "USD")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-sm text-gray-600">{tx("No orders yet.", "Chua co don hang.")}</p>
          )}
        </div>
      </section>

      <section className="glass-card space-y-6 rounded-3xl p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="section-title text-2xl font-semibold text-gray-900">
              {tx("Categories", "Danh muc")}
            </h2>
            <p className="text-sm text-gray-600">
              {tx("Keep the catalog organized.", "Sap xep catalog gon gang.")}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.currentTarget?.value ?? "")}
              placeholder={tx("New category", "Danh muc moi")}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleCreateCategory}
              className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white"
            >
              {tx("Add category", "Them danh muc")}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-blue-600">
          <button
            type="button"
            onClick={handleExportCategories}
            className="rounded-full border border-gray-200 px-4 py-2 font-semibold text-gray-900"
          >
            {tx("Export CSV", "Xuat CSV")}
          </button>
          <label className="cursor-pointer rounded-full border border-gray-200 px-4 py-2 font-semibold text-gray-900">
            {tx("Import CSV", "Nhap CSV")}
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.currentTarget.files?.[0];
                if (file) {
                  handleImportCategories(file);
                }
                e.currentTarget.value = "";
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => downloadCsvFile("categories-template.csv", [["title"], ["Design"], ["Marketing"]])}
            className="rounded-full border border-gray-200 px-4 py-2 font-semibold text-gray-900"
          >
            {tx("Template", "Mau CSV")}
          </button>
        </div>

        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex flex-col gap-3 rounded-2xl bg-white/70 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {editingId === category.id ? (
                    <input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.currentTarget?.value ?? "")}
                      className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm"
                    />
                  ) : (
                    category.title
                  )}
                </p>
                <p className="text-xs text-gray-600">Slug: {category.slug}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-600">
                  {category.courseCount} {tx("courses", "khoa hoc")}
                </span>
                {editingId === category.id ? (
                  <button
                    type="button"
                    onClick={() => handleUpdateCategory(category.id)}
                    className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-900"
                  >
                    {tx("Save", "Luu")}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(category.id);
                      setEditingTitle(category.title);
                    }}
                    className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-900"
                  >
                    {tx("Edit", "Sua")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(category.id)}
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-900"
                >
                  {tx("Delete", "Xoa")}
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-gray-600">
              {tx("No categories yet.", "Chua co danh muc.")}
            </p>
          )}
        </div>
      </section>

      <section className="glass-card space-y-6 rounded-3xl p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="section-title text-2xl font-semibold text-gray-900">
              {tx("Learning paths", "Lo trinh hoc tap")}
            </h2>
            <p className="text-sm text-gray-600">
              {tx("Create structured roadmaps.", "Tao lo trinh hoc co cau truc.")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-blue-600">
            {tx("Manage sections & courses in each path.", "Quan ly bai hoc va khoa hoc trong tung lo trinh.")}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-blue-600">
          <button
            type="button"
            onClick={handleExportPaths}
            className="rounded-full border border-gray-200 px-4 py-2 font-semibold text-gray-900"
          >
            {tx("Export CSV", "Xuat CSV")}
          </button>
          <label className="cursor-pointer rounded-full border border-gray-200 px-4 py-2 font-semibold text-gray-900">
            {tx("Import CSV", "Nhap CSV")}
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.currentTarget.files?.[0];
                if (file) {
                  handleImportPaths(file);
                }
                e.currentTarget.value = "";
              }}
            />
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <input
              value={pathForm.title}
              onChange={(e) => {
                const value = e.currentTarget?.value ?? "";
                setPathForm((prev) => ({ ...prev, title: value }));
              }}
              placeholder={tx("Path title", "Ten lo trinh")}
              className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
            />
            <textarea
              value={pathForm.description}
              onChange={(e) => {
                const value = e.currentTarget?.value ?? "";
                setPathForm((prev) => ({ ...prev, description: value }));
              }}
              placeholder={tx("Short description", "Mo ta ngan")}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm"
              rows={3}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={pathForm.level}
                onChange={(e) => {
                  const value = e.currentTarget?.value ?? "";
                  setPathForm((prev) => ({ ...prev, level: value }));
                }}
                placeholder={tx("Level", "Cap do")}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
              />
              <input
                type="number"
                value={pathForm.estimatedHours}
                onChange={(e) => {
                  const value = e.currentTarget?.value ?? "";
                  setPathForm((prev) => ({ ...prev, estimatedHours: Number(value) }));
                }}
                placeholder={tx("Hours", "So gio")}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
              />
            </div>
            <input
              value={pathForm.thumbnailUrl}
              onChange={(e) => {
                const value = e.currentTarget?.value ?? "";
                setPathForm((prev) => ({ ...prev, thumbnailUrl: value }));
              }}
              placeholder={tx("Thumbnail URL", "Link anh")}
              className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-900">
              <input
                type="checkbox"
                checked={pathForm.isPublished}
                onChange={(e) => {
                  const checked = e.currentTarget.checked;
                  setPathForm((prev) => ({ ...prev, isPublished: checked }));
                }}
              />
              {tx("Published", "Xuat ban")}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSavePath}
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white"
              >
                {editingPathId ? tx("Save changes", "Luu thay doi") : tx("Add path", "Them lo trinh")}
              </button>
              {editingPathId && (
                <button
                  type="button"
                  onClick={resetPathForm}
                  className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-900"
                >
                  {tx("Cancel", "Huy")}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {learningPaths.map((path) => (
              <div
                key={path.id}
                className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white/70 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">{path.title}</p>
                  <p className="text-xs text-gray-600">Slug: {path.slug}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-gray-600">
                  <span>{path.courseCount} {tx("courses", "khoa hoc")}</span>
                  <span>{path.level}</span>
                  <span>{path.isPublished ? tx("Published", "Xuat ban") : tx("Draft", "Ban nhap")}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/paths/${path.id}`}
                    className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-900"
                  >
                    {tx("Manage", "Quan ly")}
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleEditPath(path)}
                    className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-900"
                  >
                    {tx("Edit", "Sua")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePath(path.id)}
                    className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-900"
                  >
                    {tx("Delete", "Xoa")}
                  </button>
                </div>
              </div>
            ))}
            {learningPaths.length === 0 && (
              <p className="text-sm text-gray-600">
                {tx("No learning paths yet.", "Chua co lo trinh hoc tap.")}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="glass-card space-y-6 rounded-3xl p-8">
        <div>
          <h2 className="section-title text-2xl font-semibold text-gray-900">
            {tx("Homepage blocks", "Block trang chu")}
          </h2>
          <p className="text-sm text-gray-600">
            {tx("Control banners and highlight sections.", "Quan ly banner va cac khoi noi bat.")}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={blockForm.key}
                onChange={(e) => {
                  const value = e.currentTarget?.value ?? "";
                  setBlockForm((prev) => ({ ...prev, key: value }));
                }}
                placeholder={tx("Key", "Ma block")}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
              />
              <input
                value={blockForm.type}
                onChange={(e) => {
                  const value = e.currentTarget?.value ?? "";
                  setBlockForm((prev) => ({ ...prev, type: value }));
                }}
                placeholder={tx("Type (hero/cta/feature)", "Loai block")}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
              />
            </div>
            <input
              value={blockForm.title}
              onChange={(e) => {
                const value = e.currentTarget?.value ?? "";
                setBlockForm((prev) => ({ ...prev, title: value }));
              }}
              placeholder={tx("Title", "Tieu de")}
              className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
            />
            <textarea
              value={blockForm.subtitle}
              onChange={(e) => {
                const value = e.currentTarget?.value ?? "";
                setBlockForm((prev) => ({ ...prev, subtitle: value }));
              }}
              placeholder={tx("Subtitle", "Mo ta")}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm"
              rows={3}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={blockForm.ctaText}
                onChange={(e) => {
                  const value = e.currentTarget?.value ?? "";
                  setBlockForm((prev) => ({ ...prev, ctaText: value }));
                }}
                placeholder={tx("CTA text", "Nut CTA")}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
              />
              <input
                value={blockForm.ctaUrl}
                onChange={(e) => {
                  const value = e.currentTarget?.value ?? "";
                  setBlockForm((prev) => ({ ...prev, ctaUrl: value }));
                }}
                placeholder={tx("CTA URL", "Link CTA")}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
              />
            </div>
            <input
              value={blockForm.imageUrl}
              onChange={(e) => {
                const value = e.currentTarget?.value ?? "";
                setBlockForm((prev) => ({ ...prev, imageUrl: value }));
              }}
              placeholder={tx("Image URL", "Link anh")}
              className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
            />
            <textarea
              value={blockForm.itemsJson}
              onChange={(e) => {
                const value = e.currentTarget?.value ?? "";
                setBlockForm((prev) => ({ ...prev, itemsJson: value }));
              }}
              placeholder={tx("Items JSON (optional)", "Items JSON (tuy chon)")}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-xs"
              rows={3}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={blockForm.locale}
                onChange={(e) => {
                  const value = e.currentTarget?.value ?? "";
                  setBlockForm((prev) => ({ ...prev, locale: value }));
                }}
                placeholder={tx("Locale (en/vi)", "Ngon ngu (en/vi)")}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
              />
              <input
                type="number"
                value={blockForm.sortOrder}
                onChange={(e) => {
                  const value = e.currentTarget?.value ?? "";
                  setBlockForm((prev) => ({ ...prev, sortOrder: Number(value) }));
                }}
                placeholder={tx("Sort order", "Thu tu")}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-900">
              <input
                type="checkbox"
                checked={blockForm.isPublished}
                onChange={(e) => {
                  const checked = e.currentTarget.checked;
                  setBlockForm((prev) => ({ ...prev, isPublished: checked }));
                }}
              />
              {tx("Published", "Xuat ban")}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSaveBlock}
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white"
              >
                {editingBlockId ? tx("Save changes", "Luu thay doi") : tx("Add block", "Them block")}
              </button>
              {editingBlockId && (
                <button
                  type="button"
                  onClick={resetBlockForm}
                  className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-900"
                >
                  {tx("Cancel", "Huy")}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={blockTypeFilter}
                onChange={(e) => setBlockTypeFilter(e.currentTarget.value)}
                className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900"
              >
                <option value="">{tx("All block types", "Tat ca loai block")}</option>
                {blockTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-gray-600">
                {canReorderBlocks
                  ? tx("Drag & drop to reorder.", "Keo tha de sap xep.")
                  : tx("Turn off filter to reorder.", "Tat bo loc de sap xep.")}
              </span>
              {isReorderingBlocks && (
                <span className="text-[11px] text-gray-600">
                  {tx("Saving order...", "Dang luu thu tu...")}
                </span>
              )}
            </div>

            {visibleBlocks.map((block) => (
              <div
                key={block.id}
                draggable={canReorderBlocks}
                onDragStart={(event) => {
                  if (!canReorderBlocks) return;
                  event.dataTransfer.effectAllowed = "move";
                  setDraggingBlockId(block.id);
                }}
                onDragOver={(event) => {
                  if (!canReorderBlocks) return;
                  event.preventDefault();
                  setDragOverBlockId(block.id);
                }}
                onDrop={async (event) => {
                  if (!canReorderBlocks || draggingBlockId === null) return;
                  event.preventDefault();
                  const fromId = draggingBlockId;
                  setDraggingBlockId(null);
                  setDragOverBlockId(null);
                  await handleReorderBlocks(fromId, block.id);
                }}
                onDragEnd={() => {
                  setDraggingBlockId(null);
                  setDragOverBlockId(null);
                }}
                className={`flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white/70 p-4 transition ${
                  canReorderBlocks ? "cursor-move" : "cursor-default"
                } ${dragOverBlockId === block.id ? "ring-2 ring-emerald-400" : ""} ${
                  draggingBlockId === block.id ? "opacity-70" : ""
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {block.type} - {block.title || block.key || "Block"}
                  </p>
                  <p className="text-xs text-gray-600">
                    {block.locale ? `Locale: ${block.locale}` : tx("Global", "Toan cuc")} -{" "}
                    {tx("Order", "Thu tu")}: {block.sortOrder} -{" "}
                    {block.isPublished ? tx("Published", "Xuat ban") : tx("Draft", "Ban nhap")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditBlock(block)}
                    className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-900"
                  >
                    {tx("Edit", "Sua")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBlock(block.id)}
                    className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-900"
                  >
                    {tx("Delete", "Xoa")}
                  </button>
                </div>
              </div>
            ))}
            {visibleBlocks.length === 0 && (
              <p className="text-sm text-gray-600">{tx("No blocks yet.", "Chua co block.")}</p>
            )}
          </div>
        </div>
      </section>

      <section className="glass-card space-y-6 rounded-3xl p-8">
        <div>
          <h2 className="section-title text-2xl font-semibold text-gray-900">
            {tx("Blog posts", "Bai viet")}
          </h2>
          <p className="text-sm text-gray-600">
            {tx("Publish news and learning updates.", "Dang tin tuc va noi dung huong dan.")}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <input
              value={blogForm.title}
              onChange={(e) => {
                const value = e.currentTarget?.value ?? "";
                setBlogForm((prev) => ({ ...prev, title: value }));
              }}
              placeholder={tx("Title", "Tieu de")}
              className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
            />
            <input
              value={blogForm.slug}
              onChange={(e) => {
                const value = e.currentTarget?.value ?? "";
                setBlogForm((prev) => ({ ...prev, slug: value }));
              }}
              placeholder={tx("Slug (optional)", "Slug (tuy chon)")}
              className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
            />
            <textarea
              value={blogForm.summary}
              onChange={(e) => {
                const value = e.currentTarget?.value ?? "";
                setBlogForm((prev) => ({ ...prev, summary: value }));
              }}
              placeholder={tx("Summary", "Tom tat")}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm"
              rows={3}
            />
            <textarea
              value={blogForm.content}
              onChange={(e) => {
                const value = e.currentTarget?.value ?? "";
                setBlogForm((prev) => ({ ...prev, content: value }));
              }}
              placeholder={tx("Content", "Noi dung")}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm"
              rows={6}
            />
            <input
              value={blogForm.coverImageUrl}
              onChange={(e) => {
                const value = e.currentTarget?.value ?? "";
                setBlogForm((prev) => ({ ...prev, coverImageUrl: value }));
              }}
              placeholder={tx("Cover image URL", "Link anh cover")}
              className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={blogForm.authorName}
                onChange={(e) => {
                  const value = e.currentTarget?.value ?? "";
                  setBlogForm((prev) => ({ ...prev, authorName: value }));
                }}
                placeholder={tx("Author name", "Ten tac gia")}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
              />
              <input
                value={blogForm.tags}
                onChange={(e) => {
                  const value = e.currentTarget?.value ?? "";
                  setBlogForm((prev) => ({ ...prev, tags: value }));
                }}
                placeholder={tx("Tags (comma separated)", "Tags (ngan cach boi dau phay)")}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={blogForm.locale}
                onChange={(e) => {
                  const value = e.currentTarget?.value ?? "";
                  setBlogForm((prev) => ({ ...prev, locale: value }));
                }}
                placeholder={tx("Locale (en/vi)", "Ngon ngu (en/vi)")}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
              />
              <input
                type="datetime-local"
                value={blogForm.publishedAt}
                onChange={(e) => {
                  const value = e.currentTarget?.value ?? "";
                  setBlogForm((prev) => ({ ...prev, publishedAt: value }));
                }}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
              />
            </div>
            <input
              value={blogForm.seoTitle}
              onChange={(e) => {
                const value = e.currentTarget?.value ?? "";
                setBlogForm((prev) => ({ ...prev, seoTitle: value }));
              }}
              placeholder={tx("SEO title", "SEO title")}
              className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
            />
            <textarea
              value={blogForm.seoDescription}
              onChange={(e) => {
                const value = e.currentTarget?.value ?? "";
                setBlogForm((prev) => ({ ...prev, seoDescription: value }));
              }}
              placeholder={tx("SEO description", "SEO description")}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm"
              rows={3}
            />
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-900">
              <input
                type="checkbox"
                checked={blogForm.isPublished}
                onChange={(e) => {
                  const checked = e.currentTarget.checked;
                  setBlogForm((prev) => ({ ...prev, isPublished: checked }));
                }}
              />
              {tx("Published", "Xuat ban")}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSaveBlog}
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white"
              >
                {editingBlogId ? tx("Save changes", "Luu thay doi") : tx("Add post", "Them bai viet")}
              </button>
              {editingBlogId && (
                <button
                  type="button"
                  onClick={resetBlogForm}
                  className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-900"
                >
                  {tx("Cancel", "Huy")}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {blogPosts.map((post) => (
              <div
                key={post.id}
                className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white/70 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">{post.title}</p>
                  <p className="text-xs text-gray-600">Slug: {post.slug}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-gray-600">
                  <span>{post.locale}</span>
                  <span>{post.isPublished ? tx("Published", "Xuat ban") : tx("Draft", "Ban nhap")}</span>
                  {post.publishedAt && <span>{new Date(post.publishedAt).toLocaleDateString()}</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditBlog(post.id)}
                    className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-900"
                  >
                    {tx("Edit", "Sua")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBlog(post.id)}
                    className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-900"
                  >
                    {tx("Delete", "Xoa")}
                  </button>
                </div>
              </div>
            ))}
            {blogPosts.length === 0 && (
              <p className="text-sm text-gray-600">{tx("No posts yet.", "Chua co bai viet.")}</p>
            )}
          </div>
        </div>
      </section>

      <section className="glass-card space-y-6 rounded-3xl p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="section-title text-2xl font-semibold text-gray-900">
              {tx("Reviews & feedback", "Danh gia & phan hoi")}
            </h2>
            <p className="text-sm text-gray-600">
              {tx("Moderate learner feedback.", "Quan ly phan hoi cua hoc vien.")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={reviewQuery}
              onChange={(e) => setReviewQuery(e.currentTarget.value)}
              placeholder={tx("Search comments", "Tim binh luan")}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs"
            />
            <select
              value={reviewCourseFilter}
              onChange={(e) => setReviewCourseFilter(e.currentTarget.value)}
              className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900"
            >
              <option value="">{tx("All courses", "Tat ca khoa hoc")}</option>
              {adminCourses.map((course) => (
                <option key={course.id} value={String(course.id)}>
                  {course.title}
                </option>
              ))}
            </select>
            <select
              value={reviewTake}
              onChange={(e) => setReviewTake(Number(e.currentTarget.value))}
              className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs"
            >
              <option value={60}>60</option>
              <option value={120}>120</option>
              <option value={200}>200</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="flex flex-col gap-3 rounded-2xl bg-white/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{review.courseTitle}</p>
                  <p className="text-xs text-gray-600">
                    {review.userName} � {review.userEmail}
                  </p>
                </div>
                <div className="text-xs font-semibold text-gray-600">
                  {review.rating} ?
                </div>
              </div>
              <p className="text-sm text-gray-900/80">{review.comment}</p>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-600">
                <span>{new Date(review.createdAt).toLocaleString()}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteReview(review.id)}
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-900"
                >
                  {tx("Delete", "Xoa")}
                </button>
              </div>
            </div>
          ))}
          {reviews.length === 0 && (
            <p className="text-sm text-gray-600">{tx("No reviews yet.", "Chua co danh gia.")}</p>
          )}
        </div>
      </section>

      <section className="glass-card space-y-6 rounded-3xl p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="section-title text-2xl font-semibold text-gray-900">
              {tx("Users", "Nguoi dung")}
            </h2>
            <p className="text-sm text-gray-600">
              {tx("Audit who has access.", "Kiem tra ai co quyen truy cap.")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.currentTarget.value)}
              className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900"
            >
              <option value="">{tx("All roles", "Tat ca vai tro")}</option>
              {(roleOptions.length > 0 ? roleOptions : ["User", "Instructor", "Admin"]).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {sortedUsers.map((user) => (
            <div key={user.id} className="flex flex-col gap-3 rounded-2xl bg-white/70 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                <p className="text-xs text-gray-600">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[11px] text-gray-600">
                  {tx("Loyalty", "Diem tich luy")}: {user.loyaltyPoints ?? 0} � {user.loyaltyTier ?? "Bronze"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={pickPrimaryRole(user.roles ?? [])}
                  onChange={(e) => handleUpdateUserRole(user.id, e.currentTarget.value)}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-semibold text-gray-900"
                >
                  {(roleOptions.length > 0 ? roleOptions : ["User", "Instructor", "Admin"]).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                    user.isAdmin ? "bg-blue-100 text-gray-900" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {user.isAdmin ? tx("Admin", "Admin") : tx("User", "Nguoi dung")}
                </span>
              </div>
            </div>
          ))}
          {sortedUsers.length === 0 && (
            <p className="text-sm text-gray-600">{tx("No users found.", "Khong tim thay nguoi dung.")}</p>
          )}
        </div>
      </section>

      <section className="glass-card space-y-6 rounded-3xl p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="section-title text-2xl font-semibold text-gray-900">
              {tx("Admin activity log", "Nhat ky quan tri")}
            </h2>
            <p className="text-sm text-gray-600">
              {tx("Track who changed what in the admin area.", "Theo doi ai da thao tac trong khu vuc quan tri.")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={auditQuery}
              onChange={(e) => setAuditQuery(e.currentTarget.value)}
              placeholder={tx("Search by email or action", "Tim theo email/hanh dong")}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs"
            />
            <select
              value={auditTake}
              onChange={(e) => setAuditTake(Number(e.currentTarget.value))}
              className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs"
            >
              <option value={40}>40</option>
              <option value={80}>80</option>
              <option value={120}>120</option>
              <option value={200}>200</option>
            </select>
            <button
              type="button"
              onClick={handleExportAuditLogs}
              className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-900"
            >
              {tx("Export CSV", "Xuat CSV")}
            </button>
            <button
              type="button"
              onClick={() => {
                const token = localStorage.getItem("token");
                if (!token) {
                  setNeedsAuth(true);
                  return;
                }
                loadAuditLogs(token);
              }}
              className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-900"
            >
              {tx("Refresh", "Lam moi")}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {auditLogs.map((log) => (
            <div key={log.id} className="flex flex-col gap-2 rounded-2xl bg-white/70 p-4 text-xs text-gray-900">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold">{log.userEmail}</span>
                <span className="text-gray-600">{new Date(log.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-600">
                <span>{log.action}</span>
                <span>{log.method}</span>
                <span>{log.path}</span>
                <span>{log.ipAddress}</span>
              </div>
              {log.detail && <p className="text-[11px] text-gray-600">{log.detail}</p>}
            </div>
          ))}
          {auditLogs.length === 0 && (
            <p className="text-sm text-gray-600">{tx("No logs yet.", "Chua co log.")}</p>
          )}
        </div>
      </section>

      <section className="glass-card space-y-6 rounded-3xl p-8">
        <div>
          <h2 className="section-title text-2xl font-semibold text-gray-900">
            {tx("Support inbox", "Ho tro khach hang")}
          </h2>
          <p className="text-sm text-gray-600">
            {tx("Review and respond to support messages.", "Xem va xu ly tin nhan ho tro.")}
          </p>
        </div>

        <div className="space-y-4">
          {supportMessages.map((item) => (
            <div key={item.id} className="rounded-2xl border border-gray-200 bg-white/70 p-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.name} - {item.email}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-semibold text-gray-900">
                  {item.status}
                </span>
              </div>
              <p className="text-sm text-gray-900">{item.message}</p>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={supportStatus[item.id] ?? item.status}
                  onChange={(e) =>
                  {
                    const value = e.currentTarget?.value ?? "";
                    setSupportStatus((prev) => ({ ...prev, [item.id]: value }));
                  }}
                  placeholder={tx("Status (open/resolved)", "Trang thai")}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs"
                />
                <input
                  value={supportNotes[item.id] ?? item.adminNote ?? ""}
                  onChange={(e) =>
                  {
                    const value = e.currentTarget?.value ?? "";
                    setSupportNotes((prev) => ({ ...prev, [item.id]: value }));
                  }}
                  placeholder={tx("Admin note", "Ghi chu quan tri")}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateSupport(item.id)}
                  className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-900"
                >
                  {tx("Update", "Cap nhat")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const token = localStorage.getItem("token");
                    if (!token) {
                      setNeedsAuth(true);
                      return;
                    }
                    loadSupportReplies(token, item.id);
                  }}
                  className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-900"
                >
                  {tx("View thread", "Xem hoi thoai")}
                </button>
              </div>

              {supportReplies[item.id]?.length ? (
                <div className="space-y-2 rounded-2xl border border-gray-200 bg-white/60 p-3">
                  {supportReplies[item.id].map((reply) => (
                    <div key={reply.id} className="text-xs text-gray-900">
                      <span className="font-semibold">
                        {reply.authorRole === "admin" ? tx("Admin", "Admin") : reply.authorName}:
                      </span>{" "}
                      {reply.message}
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <input
                  value={supportReplyDraft[item.id] ?? ""}
                  onChange={(e) => {
                    const value = e.currentTarget?.value ?? "";
                    setSupportReplyDraft((prev) => ({ ...prev, [item.id]: value }));
                  }}
                  placeholder={tx("Reply to customer", "Tra loi khach hang")}
                  className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleReplySupport(item.id)}
                  className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
                >
                  {tx("Send reply", "Gui tra loi")}
                </button>
              </div>
            </div>
          ))}
          {supportMessages.length === 0 && (
            <p className="text-sm text-gray-600">{tx("No messages yet.", "Chua co tin nhan.")}</p>
          )}
        </div>
      </section>
    </div>
  );
}


