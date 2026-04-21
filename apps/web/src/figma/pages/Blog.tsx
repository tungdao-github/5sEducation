"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/figma/compat/router";
import { Search, Clock, Eye, ChevronRight } from "lucide-react";
import { fetchBlogPosts, mapBlogPostList, type BlogPost } from "../data/api";
import { useLanguage } from "../contexts/LanguageContext";

const IMAGE_FALLBACK = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <rect width="100%" height="100%" fill="#dbeafe"/>
    <circle cx="1000" cy="150" r="200" fill="rgba(37,99,235,0.14)"/>
    <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" fill="#1e3a8a" font-family="Arial, Helvetica, sans-serif" font-size="42">EduCourse Blog</text>
  </svg>`
)}`;

function safeImage(src?: string | null) {
  return src && src.trim().length > 0 ? src : IMAGE_FALLBACK;
}

export default function Blog() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchBlogPosts({ pageSize: 50 })
      .then((data) => {
        if (!active) return;
        setPosts(data.map(mapBlogPostList));
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
      if (post.category) tags.add(post.category);
    });
    return ["Tất cả", ...Array.from(tags)];
  }, [posts]);

  const filtered = posts.filter((p) => {
    const matchCat = category === "Tất cả" || p.category === category;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = posts[0];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <div className="bg-[linear-gradient(135deg,#081221_0%,#1d4ed8_50%,#4f46e5_100%)] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">{t("blog", "title")}</h1>
          <p className="mb-8 text-slate-200">Kiến thức UX/UI Design, xu hướng thiết kế và nghiên cứu người dùng</p>
          <div className="relative mx-auto max-w-xl">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              className="w-full rounded-full py-3 pl-11 pr-4 text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.14)] focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {!loading && featured && !search && category === "Tất cả" && (
          <Link to={`/blog/${featured.slug}`} className="group mb-12 block">
            <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-[0_30px_90px_rgba(15,23,42,0.12)]">
              <div className="grid gap-0 md:grid-cols-2">
                <div className="aspect-[4/3] overflow-hidden md:aspect-auto">
                  <img src={safeImage(featured.image)} alt={featured.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                </div>
                <div className="flex flex-col justify-center p-8">
                  <span className="mb-4 inline-block w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">⭐ Bài viết nổi bật</span>
                  <div className="mb-2 text-xs font-medium text-blue-600">{featured.category}</div>
                  <h2 className="mb-3 text-2xl font-semibold text-slate-950 transition-colors group-hover:text-blue-600">{featured.title}</h2>
                  <p className="mb-4 line-clamp-3 text-slate-600">{featured.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>{featured.author}</span>
                    <div className="flex items-center gap-1"><Clock className="size-4" />{featured.readTime} phút đọc</div>
                    <div className="flex items-center gap-1"><Eye className="size-4" />{featured.views.toLocaleString()}</div>
                  </div>
                  <div className="mt-4 flex items-center gap-1 font-medium text-blue-600 transition-all group-hover:gap-2">{t("blog", "readMore")} <ChevronRight className="size-4" /></div>
                </div>
              </div>
            </div>
          </Link>
        )}

        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${category === cat ? "bg-blue-600 text-white" : "border border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-600"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">Đang tải bài viết...</div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
                  <div className="aspect-video overflow-hidden">
                    <img src={safeImage(post.image)} alt={post.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-2 text-xs font-medium text-blue-600">{post.category}</div>
                    <h3 className="mb-2 flex-1 line-clamp-2 font-semibold text-slate-950 transition-colors group-hover:text-blue-600">{post.title}</h3>
                    <p className="mb-4 line-clamp-2 text-sm text-slate-500">{post.excerpt}</p>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <div className="flex size-6 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2563eb,#7c3aed)] text-[10px] font-bold text-white">{post.author.charAt(0)}</div>
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1"><Clock className="size-3" />{post.readTime} phút</div>
                        <div className="flex items-center gap-1"><Eye className="size-3" />{post.views.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-500">Không tìm thấy bài viết phù hợp</p>
          </div>
        )}
      </div>
    </div>
  );
}
