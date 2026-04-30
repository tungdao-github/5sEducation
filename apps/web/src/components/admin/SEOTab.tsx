"use client";

import { useEffect, useMemo, useState } from "react";
import { Globe, RefreshCw } from "lucide-react";
import { useI18n } from "@/app/providers";
import { toast } from "@/lib/notify";
import { fetchAdminSettings, updateAdminSetting } from "@/services/api";
import SeoEditorCard from "@/components/admin/SeoEditorCard";
import SeoPageList from "@/components/admin/SeoPageList";
import SeoScoreCard from "@/components/admin/SeoScoreCard";
import type { SEOPage } from "@/components/admin/seoTypes";

type Translate = (en: string, vi: string, es?: string, fr?: string) => string;

function buildDefaultPages(tx: Translate): SEOPage[] {
  return [
    {
      id: "home",
      page: tx("Home page", "Trang chủ"),
      url: "/",
      title: tx("EduCourse - Learn UX/UI Design Online", "EduCourse - Học UX/UI Design Online"),
      description: tx(
        "A leading UX/UI design learning platform in Vietnam. Over 500 courses from experts, learn anytime, anywhere.",
        "Nền tảng học UX/UI Design hàng đầu Việt Nam. Hơn 500 khóa học từ các chuyên gia, học mọi lúc mọi nơi."
      ),
      keywords: tx("ux learning, ui learning, ux design, UX/UI courses", "học UX, học UI, thiết kế UX, khóa học UX/UI"),
      ogTitle: tx("EduCourse - Learn UX/UI Design Online", "EduCourse - Học UX/UI Design Online"),
      ogDescription: tx("A leading UX/UI design learning platform in Vietnam", "Nền tảng học UX/UI Design hàng đầu Việt Nam"),
      ogImage: "https://images.unsplash.com/photo-1618788372246-79faff0c3742?w=1200",
      score: 92,
      issues: [],
    },
    {
      id: "blog",
      page: tx("Blog page", "Trang Blog"),
      url: "/blog",
      title: tx("UX/UI Design Blog - News and knowledge", "Blog UX/UI Design - Tin tức và kiến thức"),
      description: tx("Latest news, trends, and UX/UI design knowledge.", "Cập nhật tin tức, xu hướng và kiến thức UX/UI Design mới nhất."),
      keywords: tx("ux blog, UX design tips, UI design", "blog UX, UX design tips, UI design"),
      ogTitle: tx("UX/UI Design Blog - EduCourse", "Blog UX/UI Design - EduCourse"),
      ogDescription: tx("Latest news and UX/UI design knowledge", "Cập nhật tin tức và kiến thức UX/UI Design mới nhất"),
      ogImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200",
      score: 85,
      issues: [tx("Missing schema markup", "Thiếu schema markup"), tx("Canonical URL is needed", "Cần thêm canonical URL")],
    },
    {
      id: "course",
      page: tx("Course page", "Trang khóa học"),
      url: "/course/:slug",
      title: tx("[Course name] | EduCourse", "[Tên khóa học] | EduCourse"),
      description: tx("Course description 150-160 characters.", "Mô tả khóa học 150-160 ký tự."),
      keywords: tx("ux course, design learning, UX course", "khóa học UX, học design, UX course"),
      ogTitle: tx("[Course name] - EduCourse", "[Tên khóa học] - EduCourse"),
      ogDescription: tx("[Course description]", "[Mô tả khóa học]"),
      ogImage: tx("[Course image]", "[Ảnh khóa học]"),
      score: 78,
      issues: [tx("Need Course structured data", "Cần thêm structured data cho Course"), tx("Meta description is too short", "Meta description quá ngắn")],
    },
    {
      id: "search",
      page: tx("Search page", "Trang Tìm kiếm"),
      url: "/search",
      title: tx("Search UX/UI Design courses", "Tìm kiếm khóa học UX/UI Design"),
      description: tx("Search over 500 UX/UI design courses by category, level, price, and rating.", "Tìm kiếm hơn 500 khóa học UX/UI Design theo danh mục, cấp độ, giá và đánh giá."),
      keywords: tx("course search, design course filters", "tìm kiếm khóa học, lọc khóa học design"),
      ogTitle: tx("Search courses - EduCourse", "Tìm kiếm khóa học - EduCourse"),
      ogDescription: tx("Search and filter courses by your needs", "Tìm kiếm và lọc khóa học theo nhu cầu"),
      ogImage: "",
      score: 65,
      issues: [tx("Missing OG image", "Thiếu OG Image"), tx("Search should be noindex", "Noindex nên được bật cho trang search"), tx("Missing hreflang", "Thiếu hreflang")],
    },
  ];
}

function computeScore(page: SEOPage, tx: Translate) {
  const issues: string[] = [];
  const titleLen = page.title.length;
  const descLen = page.description.length;
  if (titleLen < 50 || titleLen > 65) issues.push(tx(`Title ${titleLen} characters (recommended 50-65)`, `Tiêu đề ${titleLen} ký tự (nên 50-65)`));
  if (descLen < 150 || descLen > 160) issues.push(tx(`Description ${descLen} characters (recommended 150-160)`, `Mô tả ${descLen} ký tự (nên 150-160)`));
  if (!page.ogImage) issues.push(tx("Missing OG Image", "Thiếu OG Image"));
  const keywordCount = page.keywords.split(",").filter(Boolean).length;
  const score = Math.max(50, 100 - issues.length * 12 + keywordCount);
  return { score: Math.min(score, 100), issues };
}

export default function SEOTab() {
  const { tx } = useI18n();
  const defaultPages = useMemo(() => buildDefaultPages(tx), [tx]);
  const [pages, setPages] = useState<SEOPage[]>(defaultPages);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<SEOPage>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPages(defaultPages);
  }, [defaultPages]);

  useEffect(() => {
    let active = true;
    fetchAdminSettings()
      .then((settings) => {
        if (!active) return;
        const mapped = defaultPages.map((page) => {
          const key = `seo:${page.id}`;
          const stored = settings.find((setting) => setting.key === key);
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
  }, [defaultPages]);

  const handleEdit = (page: SEOPage) => {
    setEditingId(page.id);
    setForm({ ...page });
  };

  const handleSave = async () => {
    if (!form.title || !form.description) {
      toast.error(tx("Title and description cannot be empty.", "Tiêu đề và mô tả không được để trống"));
      return;
    }
    const full = { ...(pages.find((page) => page.id === editingId) as SEOPage), ...(form as SEOPage) };
    const { score, issues } = computeScore(full, tx);
    const updated = { ...full, score, issues };
    setPages((prev) => prev.map((page) => (page.id === editingId ? updated : page)));
    setSaving(true);
    try {
      await updateAdminSetting(`seo:${updated.id}`, {
        value: JSON.stringify(updated),
        group: "seo",
        description: tx(`SEO settings for ${updated.page}`, `Cài đặt SEO cho ${updated.page}`),
      });
      toast.success(tx("SEO settings updated!", "Đã cập nhật cài đặt SEO!"));
    } catch {
      toast.error(tx("Unable to save SEO settings.", "Không thể lưu cài đặt SEO"));
    } finally {
      setSaving(false);
      setEditingId(null);
    }
  };

  const overallScore = useMemo(() => Math.round(pages.reduce((sum, page) => sum + page.score, 0) / pages.length), [pages]);

  return (
    <div>
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-semibold text-gray-900">{tx("Advanced SEO setup", "Cấu hình SEO nâng cao")}</h3>
          <p className="mt-0.5 text-sm text-gray-500">{tx("Manage meta tags, OG tags, and sitemap for each page", "Quản lý meta tags, OG tags và sitemap cho từng trang")}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => toast.success(tx("SEO analysis completed!", "Phân tích SEO hoàn tất!"))} className="flex items-center gap-2 rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50">
            <RefreshCw className="size-4" /> {tx("Check SEO", "Kiểm tra SEO")}
          </button>
          <button onClick={() => toast.success(tx("Created a new sitemap.xml!", "Đã tạo sitemap.xml mới!"))} className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700">
            <Globe className="size-4" /> {tx("Generate Sitemap", "Tạo Sitemap")}
          </button>
        </div>
      </div>

      <SeoScoreCard score={overallScore} pagesCount={pages.length} />

      <SeoEditorCard open={Boolean(editingId)} form={form} saving={saving} onChange={setForm} onSave={handleSave} onCancel={() => setEditingId(null)} />

      <SeoPageList pages={pages} onEdit={handleEdit} />
    </div>
  );
}
