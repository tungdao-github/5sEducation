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
}

export default function AdminPage() {
  const { tx } = useI18n();
  const [needsAuth, setNeedsAuth] = useState(false);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
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
  const [supportMessages, setSupportMessages] = useState<SupportMessageDto[]>([]);
  const [supportNotes, setSupportNotes] = useState<Record<number, string>>({});
  const [supportStatus, setSupportStatus] = useState<Record<number, string>>({});
  const [supportReplies, setSupportReplies] = useState<Record<number, SupportReplyDto[]>>({});
  const [supportReplyDraft, setSupportReplyDraft] = useState<Record<number, string>>({});
  const [blogPosts, setBlogPosts] = useState<BlogPostListDto[]>([]);
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
      loadCategories(token),
      loadLearningPaths(token),
      loadHomeBlocks(token),
      loadBlogPosts(token),
      loadSupportMessages(token),
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

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.email.localeCompare(b.email)),
    [users]
  );

  if (needsAuth) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-16 fade-in">
        <div className="glass-card rounded-3xl p-10 text-center">
          <p className="text-sm text-emerald-800/70">
            {tx("Admin access only.", "Chi danh cho quan tri vien.")}
          </p>
          <Link
            href="/login?next=/admin"
            className="mt-4 inline-flex rounded-full bg-emerald-700 px-6 py-2 text-sm font-semibold text-white"
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
        <Link href="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {tx("Home", "Trang chu")}
        </Link>
        <h1 className="section-title text-4xl font-semibold text-emerald-950">
          {tx("Admin console", "Bang quan tri")}
        </h1>
        <p className="text-sm text-emerald-800/70">
          {tx("Manage categories and user access.", "Quan ly danh muc va quyen truy cap nguoi dung.")}
        </p>
      </div>

      {stats && (
        <section className="glass-card space-y-6 rounded-3xl p-8">
          <div>
            <h2 className="section-title text-2xl font-semibold text-emerald-950">
              {tx("Overview", "Tong quan")}
            </h2>
            <p className="text-sm text-emerald-800/70">
              {tx("Key system metrics.", "Chi so tong quan he thong.")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-emerald-100 bg-white/70 p-4">
              <p className="text-xs font-semibold text-emerald-700">{tx("Users", "Nguoi dung")}</p>
              <p className="text-2xl font-semibold text-emerald-950">{stats.totalUsers}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-white/70 p-4">
              <p className="text-xs font-semibold text-emerald-700">{tx("Courses", "Khoa hoc")}</p>
              <p className="text-2xl font-semibold text-emerald-950">
                {stats.publishedCourses}/{stats.totalCourses}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-white/70 p-4">
              <p className="text-xs font-semibold text-emerald-700">{tx("Enrollments", "Ghi danh")}</p>
              <p className="text-2xl font-semibold text-emerald-950">{stats.totalEnrollments}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-white/70 p-4">
              <p className="text-xs font-semibold text-emerald-700">{tx("Lessons", "Bai hoc")}</p>
              <p className="text-2xl font-semibold text-emerald-950">{stats.totalLessons}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-white/70 p-4">
              <p className="text-xs font-semibold text-emerald-700">{tx("Revenue", "Doanh thu")}</p>
              <p className="text-2xl font-semibold text-emerald-950">
                ${stats.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-white/70 p-4">
              <p className="text-xs font-semibold text-emerald-700">{tx("Avg rating", "Danh gia TB")}</p>
              <p className="text-2xl font-semibold text-emerald-950">{stats.averageRating.toFixed(1)}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-white/70 p-4">
              <p className="text-xs font-semibold text-emerald-700">{tx("Active 30d", "Hoat dong 30 ngay")}</p>
              <p className="text-2xl font-semibold text-emerald-950">{stats.activeStudents30d}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-white/70 p-4">
              <p className="text-xs font-semibold text-emerald-700">{tx("Open support", "Ho tro dang mo")}</p>
              <p className="text-2xl font-semibold text-emerald-950">{stats.openSupportTickets}</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("Enrollments last 7 days", "Ghi danh 7 ngay")}
            </p>
            <div className="flex items-end gap-3">
              {(() => {
                const max = Math.max(1, ...stats.enrollmentsLast7Days.map((d) => d.count));
                return stats.enrollmentsLast7Days.map((item) => (
                  <div key={item.date} className="flex flex-col items-center gap-2">
                    <div className="flex h-20 items-end">
                      <div
                        className="w-3 rounded-full bg-emerald-600"
                        style={{ height: `${Math.round((item.count / max) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-emerald-800/70">{item.date.slice(5)}</span>
                  </div>
                ));
              })()}
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
            <h2 className="section-title text-2xl font-semibold text-emerald-950">
              {tx("Categories", "Danh muc")}
            </h2>
            <p className="text-sm text-emerald-800/70">
              {tx("Keep the catalog organized.", "Sap xep catalog gon gang.")}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.currentTarget?.value ?? "")}
              placeholder={tx("New category", "Danh muc moi")}
              className="rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleCreateCategory}
              className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white"
            >
              {tx("Add category", "Them danh muc")}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex flex-col gap-3 rounded-2xl bg-white/70 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-950">
                  {editingId === category.id ? (
                    <input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.currentTarget?.value ?? "")}
                      className="rounded-full border border-emerald-100 bg-white px-3 py-1 text-sm"
                    />
                  ) : (
                    category.title
                  )}
                </p>
                <p className="text-xs text-emerald-800/70">Slug: {category.slug}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-emerald-800/70">
                  {category.courseCount} {tx("courses", "khoa hoc")}
                </span>
                {editingId === category.id ? (
                  <button
                    type="button"
                    onClick={() => handleUpdateCategory(category.id)}
                    className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-900"
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
                    className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-900"
                  >
                    {tx("Edit", "Sua")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(category.id)}
                  className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-900"
                >
                  {tx("Delete", "Xoa")}
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-emerald-800/70">
              {tx("No categories yet.", "Chua co danh muc.")}
            </p>
          )}
        </div>
      </section>

      <section className="glass-card space-y-6 rounded-3xl p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="section-title text-2xl font-semibold text-emerald-950">
              {tx("Learning paths", "Lo trinh hoc tap")}
            </h2>
            <p className="text-sm text-emerald-800/70">
              {tx("Create structured roadmaps.", "Tao lo trinh hoc co cau truc.")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-emerald-700">
            {tx("Manage sections & courses in each path.", "Quan ly bai hoc va khoa hoc trong tung lo trinh.")}
          </div>
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
              className="w-full rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm"
            />
            <textarea
              value={pathForm.description}
              onChange={(e) => {
                const value = e.currentTarget?.value ?? "";
                setPathForm((prev) => ({ ...prev, description: value }));
              }}
              placeholder={tx("Short description", "Mo ta ngan")}
              className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
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
                className="rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm"
              />
              <input
                type="number"
                value={pathForm.estimatedHours}
                onChange={(e) => {
                  const value = e.currentTarget?.value ?? "";
                  setPathForm((prev) => ({ ...prev, estimatedHours: Number(value) }));
                }}
                placeholder={tx("Hours", "So gio")}
                className="rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm"
              />
            </div>
            <input
              value={pathForm.thumbnailUrl}
              onChange={(e) => {
                const value = e.currentTarget?.value ?? "";
                setPathForm((prev) => ({ ...prev, thumbnailUrl: value }));
              }}
              placeholder={tx("Thumbnail URL", "Link anh")}
              className="w-full rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
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
                className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white"
              >
                {editingPathId ? tx("Save changes", "Luu thay doi") : tx("Add path", "Them lo trinh")}
              </button>
              {editingPathId && (
                <button
                  type="button"
                  onClick={resetPathForm}
                  className="rounded-full border border-emerald-200 px-5 py-2 text-sm font-semibold text-emerald-900"
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
                className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-white/70 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-emerald-950">{path.title}</p>
                  <p className="text-xs text-emerald-800/70">Slug: {path.slug}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-emerald-800/70">
                  <span>{path.courseCount} {tx("courses", "khoa hoc")}</span>
                  <span>{path.level}</span>
                  <span>{path.isPublished ? tx("Published", "Xuat ban") : tx("Draft", "Ban nhap")}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/paths/${path.id}`}
                    className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-900"
                  >
                    {tx("Manage", "Quan ly")}
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleEditPath(path)}
                    className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-900"
                  >
                    {tx("Edit", "Sua")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePath(path.id)}
                    className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-900"
                  >
                    {tx("Delete", "Xoa")}
                  </button>
                </div>
              </div>
            ))}
            {learningPaths.length === 0 && (
              <p className="text-sm text-emerald-800/70">
                {tx("No learning paths yet.", "Chua co lo trinh hoc tap.")}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="glass-card space-y-6 rounded-3xl p-8">
        <div>
          <h2 className="section-title text-2xl font-semibold text-emerald-950">
            {tx("Homepage blocks", "Block trang chu")}
          </h2>
          <p className="text-sm text-emerald-800/70">
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
                className="rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm"
              />
              <input
                value={blockForm.type}
                onChange={(e) => {
                  const value = e.currentTarget?.value ?? "";
                  setBlockForm((prev) => ({ ...prev, type: value }));
                }}
                placeholder={tx("Type (hero/cta/feature)", "Loai block")}
                className="rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm"
              />
            </div>
            <input
              value={blockForm.title}
              onChange={(e) => {
                const value = e.currentTarget?.value ?? "";
                setBlockForm((prev) => ({ ...prev, title: value }));
              }}
              placeholder={tx("Title", "Tieu de")}
              className="w-full rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm"
            />
            <textarea
              value={blockForm.subtitle}
              onChange={(e) => {
                const value = e.currentTarget?.value ?? "";
                setBlockForm((prev) => ({ ...prev, subtitle: value }));
              }}
              placeholder={tx("Subtitle", "Mo ta")}
              className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
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
                className="rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm"
              />
              <input
                value={blockForm.ctaUrl}
                onChange={(e) => {
                  const value = e.currentTarget?.value ?? "";
                  setBlockForm((prev) => ({ ...prev, ctaUrl: value }));
                }}
                placeholder={tx("CTA URL", "Link CTA")}
                className="rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm"
              />
            </div>
            <input
              value={blockForm.imageUrl}
              onChange={(e) => {
                const value = e.currentTarget?.value ?? "";
                setBlockForm((prev) => ({ ...prev, imageUrl: value }));
              }}
              placeholder={tx("Image URL", "Link anh")}
              className="w-full rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm"
            />
            <textarea
              value={blockForm.itemsJson}
              onChange={(e) => {
                const value = e.currentTarget?.value ?? "";
                setBlockForm((prev) => ({ ...prev, itemsJson: value }));
              }}
              placeholder={tx("Items JSON (optional)", "Items JSON (tuy chon)")}
              className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-xs"
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
                className="rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm"
              />
              <input
                type="number"
                value={blockForm.sortOrder}
                onChange={(e) => {
                  const value = e.currentTarget?.value ?? "";
                  setBlockForm((prev) => ({ ...prev, sortOrder: Number(value) }));
                }}
                placeholder={tx("Sort order", "Thu tu")}
                className="rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
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
                className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white"
              >
                {editingBlockId ? tx("Save changes", "Luu thay doi") : tx("Add block", "Them block")}
              </button>
              {editingBlockId && (
                <button
                  type="button"
                  onClick={resetBlockForm}
                  className="rounded-full border border-emerald-200 px-5 py-2 text-sm font-semibold text-emerald-900"
                >
                  {tx("Cancel", "Huy")}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {homeBlocks.map((block) => (
              <div
                key={block.id}
                className="flex flex-col gap-2 rounded-2xl border border-emerald-100 bg-white/70 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-emerald-950">
                    {block.type} - {block.title || block.key || "Block"}
                  </p>
                  <p className="text-xs text-emerald-800/70">
                    {block.locale ? `Locale: ${block.locale}` : tx("Global", "Toan cuc")} -{" "}
                    {tx("Order", "Thu tu")}: {block.sortOrder} -{" "}
                    {block.isPublished ? tx("Published", "Xuat ban") : tx("Draft", "Ban nhap")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditBlock(block)}
                    className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-900"
                  >
                    {tx("Edit", "Sua")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBlock(block.id)}
                    className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-900"
                  >
                    {tx("Delete", "Xoa")}
                  </button>
                </div>
              </div>
            ))}
            {homeBlocks.length === 0 && (
              <p className="text-sm text-emerald-800/70">{tx("No blocks yet.", "Chua co block.")}</p>
            )}
          </div>
        </div>
      </section>

      <section className="glass-card space-y-6 rounded-3xl p-8">
        <div>
          <h2 className="section-title text-2xl font-semibold text-emerald-950">
            {tx("Blog posts", "Bai viet")}
          </h2>
          <p className="text-sm text-emerald-800/70">
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
              className="w-full rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm"
            />
            <input
              value={blogForm.slug}
              onChange={(e) => {
                const value = e.currentTarget?.value ?? "";
                setBlogForm((prev) => ({ ...prev, slug: value }));
              }}
              placeholder={tx("Slug (optional)", "Slug (tuy chon)")}
              className="w-full rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm"
            />
            <textarea
              value={blogForm.summary}
              onChange={(e) => {
                const value = e.currentTarget?.value ?? "";
                setBlogForm((prev) => ({ ...prev, summary: value }));
              }}
              placeholder={tx("Summary", "Tom tat")}
              className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
              rows={3}
            />
            <textarea
              value={blogForm.content}
              onChange={(e) => {
                const value = e.currentTarget?.value ?? "";
                setBlogForm((prev) => ({ ...prev, content: value }));
              }}
              placeholder={tx("Content", "Noi dung")}
              className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
              rows={6}
            />
            <input
              value={blogForm.coverImageUrl}
              onChange={(e) => {
                const value = e.currentTarget?.value ?? "";
                setBlogForm((prev) => ({ ...prev, coverImageUrl: value }));
              }}
              placeholder={tx("Cover image URL", "Link anh cover")}
              className="w-full rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={blogForm.authorName}
                onChange={(e) => {
                  const value = e.currentTarget?.value ?? "";
                  setBlogForm((prev) => ({ ...prev, authorName: value }));
                }}
                placeholder={tx("Author name", "Ten tac gia")}
                className="rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm"
              />
              <input
                value={blogForm.tags}
                onChange={(e) => {
                  const value = e.currentTarget?.value ?? "";
                  setBlogForm((prev) => ({ ...prev, tags: value }));
                }}
                placeholder={tx("Tags (comma separated)", "Tags (ngan cach boi dau phay)")}
                className="rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm"
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
                className="rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm"
              />
              <input
                type="datetime-local"
                value={blogForm.publishedAt}
                onChange={(e) => {
                  const value = e.currentTarget?.value ?? "";
                  setBlogForm((prev) => ({ ...prev, publishedAt: value }));
                }}
                className="rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm"
              />
            </div>
            <input
              value={blogForm.seoTitle}
              onChange={(e) => {
                const value = e.currentTarget?.value ?? "";
                setBlogForm((prev) => ({ ...prev, seoTitle: value }));
              }}
              placeholder={tx("SEO title", "SEO title")}
              className="w-full rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm"
            />
            <textarea
              value={blogForm.seoDescription}
              onChange={(e) => {
                const value = e.currentTarget?.value ?? "";
                setBlogForm((prev) => ({ ...prev, seoDescription: value }));
              }}
              placeholder={tx("SEO description", "SEO description")}
              className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
              rows={3}
            />
            <label className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
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
                className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white"
              >
                {editingBlogId ? tx("Save changes", "Luu thay doi") : tx("Add post", "Them bai viet")}
              </button>
              {editingBlogId && (
                <button
                  type="button"
                  onClick={resetBlogForm}
                  className="rounded-full border border-emerald-200 px-5 py-2 text-sm font-semibold text-emerald-900"
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
                className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-white/70 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-emerald-950">{post.title}</p>
                  <p className="text-xs text-emerald-800/70">Slug: {post.slug}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-emerald-800/70">
                  <span>{post.locale}</span>
                  <span>{post.isPublished ? tx("Published", "Xuat ban") : tx("Draft", "Ban nhap")}</span>
                  {post.publishedAt && <span>{new Date(post.publishedAt).toLocaleDateString()}</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditBlog(post.id)}
                    className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-900"
                  >
                    {tx("Edit", "Sua")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBlog(post.id)}
                    className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-900"
                  >
                    {tx("Delete", "Xoa")}
                  </button>
                </div>
              </div>
            ))}
            {blogPosts.length === 0 && (
              <p className="text-sm text-emerald-800/70">{tx("No posts yet.", "Chua co bai viet.")}</p>
            )}
          </div>
        </div>
      </section>

      <section className="glass-card space-y-6 rounded-3xl p-8">
        <div>
          <h2 className="section-title text-2xl font-semibold text-emerald-950">
            {tx("Users", "Nguoi dung")}
          </h2>
          <p className="text-sm text-emerald-800/70">
            {tx("Audit who has access.", "Kiem tra ai co quyen truy cap.")}
          </p>
        </div>

        <div className="space-y-3">
          {sortedUsers.map((user) => (
            <div key={user.id} className="flex flex-col gap-3 rounded-2xl bg-white/70 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-950">{user.email}</p>
                <p className="text-xs text-emerald-800/70">
                  {user.firstName} {user.lastName}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                  user.isAdmin ? "bg-emerald-100 text-emerald-900" : "bg-slate-100 text-slate-700"
                }`}
              >
                {user.isAdmin ? tx("Admin", "Admin") : tx("User", "Nguoi dung")}
              </span>
            </div>
          ))}
          {sortedUsers.length === 0 && (
            <p className="text-sm text-emerald-800/70">{tx("No users found.", "Khong tim thay nguoi dung.")}</p>
          )}
        </div>
      </section>

      <section className="glass-card space-y-6 rounded-3xl p-8">
        <div>
          <h2 className="section-title text-2xl font-semibold text-emerald-950">
            {tx("Support inbox", "Ho tro khach hang")}
          </h2>
          <p className="text-sm text-emerald-800/70">
            {tx("Review and respond to support messages.", "Xem va xu ly tin nhan ho tro.")}
          </p>
        </div>

        <div className="space-y-4">
          {supportMessages.map((item) => (
            <div key={item.id} className="rounded-2xl border border-emerald-100 bg-white/70 p-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-emerald-950">
                    {item.name} - {item.email}
                  </p>
                  <p className="text-[11px] text-emerald-700/70">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-900">
                  {item.status}
                </span>
              </div>
              <p className="text-sm text-emerald-900">{item.message}</p>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={supportStatus[item.id] ?? item.status}
                  onChange={(e) =>
                  {
                    const value = e.currentTarget?.value ?? "";
                    setSupportStatus((prev) => ({ ...prev, [item.id]: value }));
                  }}
                  placeholder={tx("Status (open/resolved)", "Trang thai")}
                  className="rounded-full border border-emerald-100 bg-white px-4 py-2 text-xs"
                />
                <input
                  value={supportNotes[item.id] ?? item.adminNote ?? ""}
                  onChange={(e) =>
                  {
                    const value = e.currentTarget?.value ?? "";
                    setSupportNotes((prev) => ({ ...prev, [item.id]: value }));
                  }}
                  placeholder={tx("Admin note", "Ghi chu quan tri")}
                  className="rounded-full border border-emerald-100 bg-white px-4 py-2 text-xs"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateSupport(item.id)}
                  className="rounded-full border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-900"
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
                  className="rounded-full border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-900"
                >
                  {tx("View thread", "Xem hoi thoai")}
                </button>
              </div>

              {supportReplies[item.id]?.length ? (
                <div className="space-y-2 rounded-2xl border border-emerald-100 bg-white/60 p-3">
                  {supportReplies[item.id].map((reply) => (
                    <div key={reply.id} className="text-xs text-emerald-900">
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
                  className="flex-1 rounded-full border border-emerald-100 bg-white px-4 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleReplySupport(item.id)}
                  className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white"
                >
                  {tx("Send reply", "Gui tra loi")}
                </button>
              </div>
            </div>
          ))}
          {supportMessages.length === 0 && (
            <p className="text-sm text-emerald-800/70">{tx("No messages yet.", "Chua co tin nhan.")}</p>
          )}
        </div>
      </section>
    </div>
  );
}

