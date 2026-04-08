"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Globe, FileText, RefreshCw } from "lucide-react";
import { toast } from "@/figma/compat/sonner";
import { fetchAdminSettings, updateAdminSetting } from "../../data/api";

interface SEOPage {
  id: string;
  page: string;
  url: string;
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  score: number;
  issues: string[];
}

const defaultPages: SEOPage[] = [
  {
    id: "home",
    page: "Trang chủ",
    url: "/",
    title: "EduCourse - Học UX/UI Design Online",
    description: "Nền tảng học UX/UI Design hàng đầu Việt Nam. Hơn 500 khóa học từ các chuyên gia, học mọi lúc mọi nơi.",
    keywords: "học UX, học UI, thiết kế UX, khóa học UX/UI",
    ogTitle: "EduCourse - Học UX/UI Design Online",
    ogDescription: "Nền tảng học UX/UI Design hàng đầu Việt Nam",
    ogImage: "https://images.unsplash.com/photo-1618788372246-79faff0c3742?w=1200",
    score: 92,
    issues: [],
  },
  {
    id: "blog",
    page: "Trang Blog",
    url: "/blog",
    title: "Blog UX/UI Design - Tin tức và kiến thức",
    description: "Cập nhật tin tức, xu hướng và kiến thức UX/UI Design mới nhất.",
    keywords: "blog UX, UX design tips, UI design",
    ogTitle: "Blog UX/UI Design - EduCourse",
    ogDescription: "Cập nhật tin tức và kiến thức UX/UI Design mới nhất",
    ogImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200",
    score: 85,
    issues: ["Thiếu schema markup", "Cần thêm canonical URL"],
  },
  {
    id: "course",
    page: "Trang Khóa học",
    url: "/course/:slug",
    title: "[Tên khóa học] | EduCourse",
    description: "Mô tả khóa học 150-160 ký tự.",
    keywords: "khóa học UX, học design, UX course",
    ogTitle: "[Tên khóa học] - EduCourse",
    ogDescription: "[Mô tả khóa học]",
    ogImage: "[Ảnh khóa học]",
    score: 78,
    issues: ["Cần thêm structured data cho Course", "Meta description quá ngắn"],
  },
  {
    id: "search",
    page: "Trang Tìm kiếm",
    url: "/search",
    title: "Tìm kiếm khóa học UX/UI Design",
    description: "Tìm kiếm hơn 500 khóa học UX/UI Design theo danh mục, cấp độ, giá và đánh giá.",
    keywords: "tìm kiếm khóa học, lọc khóa học design",
    ogTitle: "Tìm kiếm khóa học - EduCourse",
    ogDescription: "Tìm kiếm và lọc khóa học theo nhu cầu",
    ogImage: "",
    score: 65,
    issues: ["Thiếu OG Image", "Noindex nên được bật cho trang search", "Thiếu hreflang"],
  },
];

function computeScore(page: SEOPage) {
  const issues: string[] = [];
  const titleLen = page.title.length;
  const descLen = page.description.length;
  if (titleLen < 50 || titleLen > 65) issues.push(`Tiêu đề ${titleLen} ký tự (nên 50-65)`);
  if (descLen < 150 || descLen > 160) issues.push(`Mô tả ${descLen} ký tự (nên 150-160)`);
  if (!page.ogImage) issues.push("Thiếu OG Image");
  const keywordCount = page.keywords.split(",").filter(Boolean).length;
  const score = Math.max(50, 100 - issues.length * 12 + keywordCount);
  return { score: Math.min(score, 100), issues };
}

export default function SEOTab() {
  const [pages, setPages] = useState<SEOPage[]>(defaultPages);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<SEOPage>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetchAdminSettings()
      .then((settings) => {
        if (!active) return;
        const mapped = defaultPages.map((page) => {
          const key = `seo:${page.id}`;
          const stored = settings.find((s) => s.key === key);
          if (!stored?.value) return page;
          try {
            const parsed = JSON.parse(stored.value) as Partial<SEOPage>;
            return { ...page, ...parsed };
          } catch {
            return page;
          }
        });
        setPages(mapped);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  const handleEdit = (page: SEOPage) => {
    setEditingId(page.id);
    setForm({ ...page });
  };

  const handleSave = async () => {
    if (!form.title || !form.description) {
      toast.error("Tiêu đề và mô tả không được để trống");
      return;
    }
    const full = { ...(pages.find((p) => p.id === editingId) as SEOPage), ...(form as SEOPage) };
    const { score, issues } = computeScore(full);
    const updated = { ...full, score, issues };
    setPages((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
    setSaving(true);
    try {
      await updateAdminSetting(`seo:${updated.id}`, {
        value: JSON.stringify(updated),
        group: "seo",
        description: `SEO settings for ${updated.page}`,
      });
      toast.success("Đã cập nhật cài đặt SEO!");
    } catch {
      toast.error("Không thể lưu cài đặt SEO");
    } finally {
      setSaving(false);
      setEditingId(null);
    }
  };

  const overallScore = useMemo(() => Math.round(pages.reduce((s, p) => s + p.score, 0) / pages.length), [pages]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-semibold text-gray-900">Cấu hình SEO nâng cao</h3>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý meta tags, OG tags và sitemap cho từng trang</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => toast.success("Phân tích SEO hoàn tất!")}
            className="flex items-center gap-2 border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition text-sm font-medium"
          >
            <RefreshCw className="size-4" /> Kiểm tra SEO
          </button>
          <button
            onClick={() => toast.success("Đã tạo sitemap.xml mới!")}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium"
          >
            <Globe className="size-4" />
            Tạo Sitemap
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">Điểm SEO tổng thể</p>
            <p className="text-sm text-gray-500 mt-0.5">Dựa trên {pages.length} trang chính</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">{overallScore}</div>
            <div className="text-xs text-gray-500">/100</div>
          </div>
        </div>
      </div>

      {editingId && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Chỉnh sửa SEO</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <input
                value={form.title || ""}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea
                value={form.description || ""}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
              <input
                value={form.keywords || ""}
                onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OG Title</label>
                <input
                  value={form.ogTitle || ""}
                  onChange={(e) => setForm((f) => ({ ...f, ogTitle: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
                <input
                  value={form.ogImage || ""}
                  onChange={(e) => setForm((f) => ({ ...f, ogImage: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-60">
                Lưu
              </button>
              <button onClick={() => setEditingId(null)} className="border border-gray-300 px-5 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {pages.map((page) => (
          <div key={page.id} className="border border-gray-200 rounded-xl p-4 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Search className="size-4 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">{page.page}</h4>
                </div>
                <p className="text-xs text-gray-500">{page.url}</p>
              </div>
              <button onClick={() => handleEdit(page)} className="text-sm text-blue-600 hover:underline">Chỉnh sửa</button>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              <p><strong>Title:</strong> {page.title}</p>
              <p><strong>Description:</strong> {page.description}</p>
              {page.issues.length > 0 && (
                <div className="mt-2 text-xs text-orange-600">
                  {page.issues.map((issue) => (
                    <div key={issue}>• {issue}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
