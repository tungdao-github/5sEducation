"use client";

import { useEffect, useState } from "react";
import { useParams, Link } from "@/figma/compat/router";
import { ArrowLeft, Clock, Eye, Calendar, Tag, Share2, BookOpen, MessageCircle, ThumbsUp, Send, Bell } from "lucide-react";
import {
  fetchBlogPostDetail,
  fetchBlogPosts,
  mapBlogPostDetail,
  mapBlogPostList,
  fetchBlogComments,
  createBlogComment,
  toggleBlogCommentLike,
  type BlogPost,
  type BlogComment,
} from "../data/api";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "@/figma/compat/sonner";

const IMAGE_FALLBACK = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <rect width="100%" height="100%" fill="#dbeafe"/>
    <circle cx="1000" cy="140" r="210" fill="rgba(37,99,235,0.16)"/>
    <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" fill="#1e3a8a" font-family="Arial, Helvetica, sans-serif" font-size="42">EduCourse Blog</text>
  </svg>`
)}`;

function safeImage(src?: string | null) {
  return src && src.trim().length > 0 ? src : IMAGE_FALLBACK;
}

function sanitizeHtml(input: string) {
  return input
    .replace(/<\s*script[\s\S]*?<\s*\/\s*script\s*>/gi, "")
    .replace(/<\s*style[\s\S]*?<\s*\/\s*style\s*>/gi, "")
    .replace(/<\s*iframe[\s\S]*?<\s*\/\s*iframe\s*>/gi, "")
    .replace(/<\s*object[\s\S]*?<\s*\/\s*object\s*>/gi, "")
    .replace(/<\s*embed[\s\S]*?>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "")
    .replace(/\sstyle\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, ' $1="#"')
    .replace(/\s(href|src)\s*=\s*javascript:[^\s>]+/gi, ' $1="#"');
}

function CommentsSection({ slug }: { slug: string }) {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchBlogComments(slug)
      .then((data) => {
        if (!active) return;
        setComments(data);
      })
      .catch(() => {
        if (!active) return;
        setComments([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    if (!newComment.trim()) return;
    try {
      const created = await createBlogComment(slug, newComment.trim());
      setComments((prev) => [created, ...prev]);
      setNewComment("");
      toast.success("Đã đăng bình luận!");
    } catch {
      toast.error("Không thể đăng bình luận.");
    }
  };

  const handleLike = async (id: number) => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    try {
      const res = await toggleBlogCommentLike(id);
      setComments((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, likeCount: res.likeCount, isLikedByUser: res.isLiked } : c
        )
      );
    } catch {
      toast.error("Không thể cập nhật lượt thích.");
    }
  };

  return (
    <div className="mt-10 border-t border-gray-200 pt-8">
      <div className="mb-6 flex items-center gap-3">
        <MessageCircle className="size-5 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-900">Bình luận ({comments.length})</h3>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2563eb,#7c3aed)] text-sm font-bold text-white">
            {user ? user.name.charAt(0) : "?"}
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onFocus={() => !isAuthenticated && openAuthModal("login")}
              placeholder={isAuthenticated ? "Chia sẻ suy nghĩ của bạn về bài viết này..." : "Đăng nhập để bình luận"}
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-2 flex justify-end">
              <button type="submit" disabled={!newComment.trim()} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">
                <Send className="size-4" />Đăng bình luận
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="space-y-5">
        {loading && <p className="text-sm text-gray-500">Đang tải bình luận...</p>}
        {!loading && comments.length === 0 && <p className="text-sm text-gray-500">Chưa có bình luận nào.</p>}
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#94a3b8,#64748b)] text-sm font-bold text-white">
              {comment.authorName?.charAt(0) || "?"}
            </div>
            <div className="flex-1">
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">{comment.authorName}</p>
                  <p className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString("vi-VN")}</p>
                </div>
                <p className="text-sm leading-relaxed text-gray-700">{comment.content}</p>
              </div>
              <div className="mt-2 flex items-center gap-3 pl-2">
                <button
                  onClick={() => handleLike(comment.id)}
                  className={`flex items-center gap-1.5 text-xs transition ${comment.isLikedByUser ? "font-medium text-blue-600" : "text-gray-400 hover:text-blue-600"}`}
                >
                  <ThumbsUp className={`size-3.5 ${comment.isLikedByUser ? "fill-blue-600" : ""}`} />
                  {comment.likeCount} thích
                </button>
                <button className="text-xs text-gray-400 transition hover:text-blue-600">Trả lời</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewsletterBox() {
  const [email, setEmail] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Đăng ký nhận bản tin thành công!");
    setEmail("");
  };
  return (
    <div className="rounded-[28px] bg-[linear-gradient(135deg,#1d4ed8_0%,#4f46e5_100%)] p-5 text-white shadow-[0_18px_50px_rgba(37,99,235,0.22)]">
      <div className="mb-3 flex items-center gap-2"><Bell className="size-5" /><h3 className="text-sm font-semibold">Nhận bài viết mới</h3></div>
      <p className="mb-4 text-xs text-blue-100">Đăng ký để nhận các bài viết UX/UI hữu ích mỗi tuần</p>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email của bạn" className="w-full rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50" />
        <button type="submit" className="w-full rounded-lg bg-white py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50">Đăng ký miễn phí</button>
      </form>
    </div>
  );
}

export default function BlogDetail() {
  const { id } = useParams();
  const { t } = useLanguage();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const load = async () => {
      try {
        const dto = await fetchBlogPostDetail(id);
        if (!active) return;
        const mappedPost = mapBlogPostDetail(dto);
        setPost(mappedPost);
        const list = await fetchBlogPosts({ pageSize: 20 });
        if (!active) return;
        const mappedList = list.map(mapBlogPostList);
        const relatedItems = mappedList.filter((p) => p.id !== mappedPost.id && p.category === mappedPost.category).slice(0, 3);
        setRelated(relatedItems);
      } catch {
        if (!active) return;
        setPost(null);
        setRelated([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [id]);

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" });

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center bg-gray-50 text-gray-500">Đang tải bài viết...</div>;
  }

  if (!post) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gray-50">
        <div className="text-center">
          <BookOpen className="mx-auto mb-3 size-12 text-gray-300" />
          <h2 className="mb-2 text-xl font-bold text-gray-700">Không tìm thấy bài viết</h2>
          <Link to="/blog" className="text-sm text-blue-600 hover:underline">← Quay lại Blog</Link>
        </div>
      </div>
    );
  }

  const shareLink = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <div className="bg-[linear-gradient(135deg,#081221_0%,#1d4ed8_50%,#4f46e5_100%)] py-14 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link to="/blog" className="mb-6 inline-flex items-center gap-2 text-sm text-blue-200 transition-colors hover:text-white"><ArrowLeft className="size-4" />{t("blog", "backToBlog")}</Link>
          <div className="mb-4 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 backdrop-blur">{post.category}</div>
          <h1 className="mb-4 text-4xl font-semibold leading-snug tracking-[-0.04em] md:text-5xl">{post.title}</h1>
          <p className="mb-6 text-lg text-slate-200">{post.excerpt}</p>
          <div className="flex flex-wrap items-center gap-5 text-sm text-slate-400">
            <div className="flex items-center gap-2"><div className="flex size-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2563eb,#7c3aed)] text-sm font-bold text-white">{post.author.charAt(0)}</div><span className="font-medium text-white">{post.author}</span></div>
            <div className="flex items-center gap-1.5"><Calendar className="size-4" />{formatDate(post.date)}</div>
            <div className="flex items-center gap-1.5"><Clock className="size-4" />{post.readTime} {t("blog", "minRead")}</div>
            <div className="flex items-center gap-1.5"><Eye className="size-4" />{post.views.toLocaleString()} lượt xem</div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <article className="lg:col-span-2">
            <div className="mb-8 overflow-hidden rounded-[32px] shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
              <img src={safeImage(post.image)} alt={post.title} className="aspect-video w-full object-cover" />
            </div>

            <div
              className="prose prose-gray max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 prose-strong:text-gray-900 prose-ul:space-y-2 prose-li:text-gray-700"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
            />

            <div className="mt-8 border-t border-gray-200 pt-6">
              <div className="flex flex-wrap items-center gap-3">
                <Tag className="size-4 text-gray-400" />
                {post.tags.map((tag) => (
                  <span key={tag} className="cursor-pointer rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 transition-colors hover:bg-blue-100 hover:text-blue-600">#{tag}</span>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900"><Share2 className="size-4 text-blue-600" />Chia sẻ bài viết</div>
              <div className="flex flex-wrap gap-2">
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`} target="_blank" rel="noreferrer" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Facebook</a>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noreferrer" className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white">X</a>
                <button onClick={() => navigator.clipboard.writeText(shareLink).then(() => toast.success("Đã sao chép liên kết!"))} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Sao chép link</button>
              </div>
            </div>

            <CommentsSection slug={post.slug} />
          </article>

          <aside className="space-y-6">
            <NewsletterBox />

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Bài viết liên quan</h3>
              <div className="space-y-4">
                {related.map((item) => (
                  <Link key={item.id} to={`/blog/${item.slug}`} className="group block">
                    <div className="flex gap-3 rounded-2xl border border-slate-200 p-3 transition-colors hover:border-blue-200 hover:bg-blue-50/40">
                      <img src={safeImage(item.image)} alt={item.title} className="h-16 w-20 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 text-xs font-medium text-blue-600">{item.category}</div>
                        <p className="line-clamp-2 text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-600">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.readTime} phút đọc</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
