"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, Search, X, Check, Eye, Calendar, Clock } from "lucide-react";
import { toast } from "@/figma/compat/sonner";
import {
  fetchAdminBlogPosts,
  createAdminBlogPost,
  updateAdminBlogPost,
  deleteAdminBlogPost,
  fetchAdminBlogPostDetail,
  type BlogPostAdminDto,
} from "../../data/api";

type BlogFormState = {
  title: string;
  summary: string;
  content: string;
  authorName: string;
  tags: string;
  locale: string;
  coverImageUrl: string;
  isPublished: boolean;
  seoTitle: string;
  seoDescription: string;
  slug: string;
};

const defaultForm: BlogFormState = {
  title: "",
  summary: "",
  content: "",
  authorName: "",
  tags: "",
  locale: "vi",
  coverImageUrl: "",
  isPublished: true,
  seoTitle: "",
  seoDescription: "",
  slug: "",
};

export default function BlogTab() {
  const [posts, setPosts] = useState<BlogPostAdminDto[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<BlogFormState>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchAdminBlogPosts()
      .then((data) => {
        if (!active) return;
        setPosts(data);
      })
      .catch(() => {
        if (!active) return;
        setPosts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach((post) => {
      (post.tags || []).forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  }, [posts]);

  const filtered = posts.filter((post) => {
    const term = search.toLowerCase();
    return (
      post.title.toLowerCase().includes(term)
      || post.authorName.toLowerCase().includes(term)
      || (post.tags || []).some((tag) => tag.toLowerCase().includes(term))
    );
  });

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = async (post: BlogPostAdminDto) => {
    try {
      const detail = await fetchAdminBlogPostDetail(post.slug);
      setForm({
        title: detail.title,
        summary: detail.summary,
        content: detail.content,
        authorName: detail.authorName,
        tags: (detail.tags || []).join(", "),
        locale: detail.locale || "vi",
        coverImageUrl: detail.coverImageUrl || "",
        isPublished: detail.publishedAt != null,
        seoTitle: detail.seoTitle || "",
        seoDescription: detail.seoDescription || "",
        slug: detail.slug || "",
      });
      setEditingId(detail.id);
      setShowForm(true);
    } catch {
      toast.error("KhÃ´ng thá»ƒ táº£i bÃ i viáº¿t.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAdminBlogPost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("ÄÃ£ xÃ³a bÃ i viáº¿t!");
    } catch {
      toast.error("KhÃ´ng thá»ƒ xÃ³a bÃ i viáº¿t.");
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.authorName.trim() || !form.summary.trim() || !form.content.trim()) {
      toast.error("TiÃªu Ä‘á», tÃ¡c giáº£, mÃ´ táº£ vÃ  ná»™i dung khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      summary: form.summary.trim(),
      content: form.content.trim(),
      authorName: form.authorName.trim(),
      locale: form.locale || "vi",
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      isPublished: form.isPublished,
      publishedAt: form.isPublished ? new Date().toISOString() : null,
      seoTitle: form.seoTitle.trim() || null,
      seoDescription: form.seoDescription.trim() || null,
      coverImageUrl: form.coverImageUrl.trim() || null,
      slug: form.slug.trim() || null,
    };

    try {
      if (editingId) {
        await updateAdminBlogPost(editingId, payload);
        const refreshed = await fetchAdminBlogPosts();
        setPosts(refreshed);
        toast.success("ÄÃ£ cáº­p nháº­t bÃ i viáº¿t!");
      } else {
        const created = await createAdminBlogPost(payload);
        setPosts((prev) => [created, ...prev]);
        toast.success("ÄÃ£ thÃªm bÃ i viáº¿t má»›i!");
      }
      resetForm();
    } catch (error) {
      toast.error("LÆ°u bÃ i viáº¿t tháº¥t báº¡i.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="TÃ¬m bÃ i viáº¿t..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm(defaultForm);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition text-sm font-medium whitespace-nowrap"
        >
          <Plus className="size-4" /> Viáº¿t bÃ i má»›i
        </button>
      </div>

      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{editingId ? "Sá»­a bÃ i viáº¿t" : "Viáº¿t bÃ i má»›i"}</h3>
            <button onClick={resetForm}><X className="size-5 text-gray-400" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">TiÃªu Ä‘á» *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="TiÃªu Ä‘á» bÃ i viáº¿t"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TÃ¡c giáº£ *</label>
              <input
                value={form.authorName}
                onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
                placeholder="TÃªn tÃ¡c giáº£"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NgÃ´n ngá»¯</label>
              <select
                value={form.locale}
                onChange={(e) => setForm((f) => ({ ...f, locale: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="vi">Tiáº¿ng Viá»‡t</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">MÃ´ táº£ ngáº¯n *</label>
              <textarea
                value={form.summary}
                onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                rows={2}
                placeholder="MÃ´ táº£ tÃ³m táº¯t bÃ i viáº¿t..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ná»™i dung (HTML) *</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={6}
                placeholder="<p>Ná»™i dung bÃ i viáº¿t...</p>"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tháº»</label>
              <input
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                placeholder="UX, Design, UI"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug URL</label>
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="tieu-de-bai-viet"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">áº¢nh Ä‘áº¡i diá»‡n</label>
              <input
                value={form.coverImageUrl}
                onChange={(e) => setForm((f) => ({ ...f, coverImageUrl: e.target.value }))}
                placeholder="https://..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
              <input
                value={form.seoTitle}
                onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
              <input
                value={form.seoDescription}
                onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Tráº¡ng thÃ¡i:</label>
              <button
                onClick={() => setForm((f) => ({ ...f, isPublished: !f.isPublished }))}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${form.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
              >
                {form.isPublished ? "Xuáº¥t báº£n" : "Báº£n nhÃ¡p"}
              </button>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-60"
            >
              <Check className="size-4" /> {saving ? "Äang lÆ°u..." : editingId ? "Cáº­p nháº­t" : "ÄÄƒng bÃ i"}
            </button>
            <button
              onClick={resetForm}
              className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              Há»§y
            </button>
          </div>
        </div>
      )}

      {loading && <p className="text-sm text-gray-500">Äang táº£i bÃ i viáº¿t...</p>}

      <div className="space-y-3">
        {filtered.map((post) => (
          <div key={post.id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-200 transition bg-white">
            <div className="flex gap-4">
              <img
                src={post.coverImageUrl || "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800"}
                alt={post.title}
                className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {(post.tags || []).slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          {tag}
                        </span>
                      ))}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(post.isPublished ?? Boolean(post.publishedAt)) ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {(post.isPublished ?? Boolean(post.publishedAt)) ? "Xuáº¥t báº£n" : "Báº£n nhÃ¡p"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{post.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{post.summary}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => handleEdit(post)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition">
                      <Edit className="size-4" />
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span>{post.authorName}</span>
                  <span className="flex items-center gap-1"><Calendar className="size-3" />{new Date(post.createdAt).toLocaleDateString("vi-VN")}</span>
                  <span className="flex items-center gap-1"><Clock className="size-3" />{post.summary ? Math.max(1, Math.round(post.summary.length / 350)) : 1} phÃºt</span>
                  <span className="flex items-center gap-1"><Eye className="size-3" />{(post.isPublished ?? Boolean(post.publishedAt)) ? "Public" : "Draft"}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400">KhÃ´ng cÃ³ bÃ i viáº¿t.</div>
        )}
      </div>
    </div>
  );
}

