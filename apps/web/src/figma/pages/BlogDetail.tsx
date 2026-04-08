"use client";

import { useEffect, useMemo, useState } from "react";
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
    <div className="mt-10 pt-8 border-t border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="size-5 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-900">Bình luận ({comments.length})</h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-3">
          <div className="size-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user ? user.name.charAt(0) : "?"}
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onFocus={() => !isAuthenticated && openAuthModal("login")}
              placeholder={isAuthenticated ? "Chia sẻ suy nghĩ của bạn về bài viết này..." : "Đăng nhập để bình luận"}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="size-4" />Đăng bình luận
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-5">
        {loading && (
          <p className="text-sm text-gray-500">Đang tải bình luận...</p>
        )}
        {!loading && comments.length === 0 && (
          <p className="text-sm text-gray-500">Chưa có bình luận nào.</p>
        )}
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="size-9 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {comment.authorName?.charAt(0) || "?"}
            </div>
            <div className="flex-1">
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-gray-900 text-sm">{comment.authorName}</p>
                  <p className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString("vi-VN")}</p>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
              </div>
              <div className="flex items-center gap-3 mt-2 pl-2">
                <button
                  onClick={() => handleLike(comment.id)}
                  className={`flex items-center gap-1.5 text-xs transition ${
                    comment.isLikedByUser ? "text-blue-600 font-medium" : "text-gray-400 hover:text-blue-600"
                  }`}
                >
                  <ThumbsUp className={`size-3.5 ${comment.isLikedByUser ? "fill-blue-600" : ""}`} />
                  {comment.likeCount} thích
                </button>
                <button className="text-xs text-gray-400 hover:text-blue-600 transition">Trả lời</button>
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
    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-5 text-white">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="size-5" />
        <h3 className="font-semibold text-sm">Nhận bài viết mới</h3>
      </div>
      <p className="text-xs text-blue-100 mb-4">Đăng ký để nhận các bài viết UX/UI hữu ích mỗi tuần</p>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email của bạn"
          className="w-full px-3 py-2 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
        />
        <button type="submit" className="w-full bg-white text-blue-600 font-semibold py-2 rounded-lg text-sm hover:bg-blue-50 transition">
          Đăng ký miễn phí
        </button>
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
        const relatedItems = mappedList
          .filter((p) => p.id !== mappedPost.id && p.category === mappedPost.category)
          .slice(0, 3);
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 text-gray-500">
        Đang tải bài viết...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <BookOpen className="size-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy bài viết</h2>
          <Link to="/blog" className="text-blue-600 hover:underline text-sm">← Quay lại Blog</Link>
        </div>
      </div>
    );
  }

  const shareLink = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-blue-900 text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/blog" className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors text-sm mb-6">
            <ArrowLeft className="size-4" />
            {t("blog", "backToBlog")}
          </Link>
          <div className="inline-block bg-blue-500/30 text-blue-200 text-xs font-medium px-3 py-1 rounded-full mb-4">
            {post.category}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-snug">{post.title}</h1>
          <p className="text-gray-300 text-lg mb-6">{post.excerpt}</p>
          <div className="flex flex-wrap items-center gap-5 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="size-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {post.author.charAt(0)}
              </div>
              <span className="text-white font-medium">{post.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              {formatDate(post.date)}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="size-4" />
              {post.readTime} {t("blog", "minRead")}
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="size-4" />
              {post.views.toLocaleString()} lượt xem
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Article */}
          <article className="lg:col-span-2">
            {/* Featured Image */}
            <div className="rounded-2xl overflow-hidden mb-8 shadow-md">
              <img src={post.image} alt={post.title} className="w-full aspect-video object-cover" />
            </div>

            {/* Content */}
            <div
              className="prose prose-gray max-w-none
                prose-headings:font-bold prose-headings:text-gray-900
                prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                prose-strong:text-gray-900
                prose-ul:space-y-2 prose-li:text-gray-700"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 flex-wrap">
                <Tag className="size-4 text-gray-400" />
                {post.tags.map((tag) => (
                  <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm hover:bg-blue-100 hover:text-blue-600 transition-colors cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Share */}
            <div className="mt-6 p-5 bg-blue-50 rounded-xl flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-900 text-sm">Chia sẻ bài viết này</p>
                <p className="text-xs text-gray-500">Giúp cộng đồng UX/UI cùng học hỏi</p>
              </div>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(shareLink).then(() => toast.success("Đã sao chép link!"))
                }
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Share2 className="size-4" />
                Chia sẻ
              </button>
            </div>

            {/* Comments */}
            <CommentsSection slug={post.slug} />
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Author card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Về tác giả</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="size-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{post.author}</p>
                  <p className="text-xs text-gray-500">UX Writer & Researcher</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Chuyên gia về thiết kế trải nghiệm người dùng với hơn 5 năm kinh nghiệm trong ngành công nghệ.
              </p>
            </div>

            {/* Newsletter */}
            <NewsletterBox />

            {/* Related posts */}
            {related.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-4 text-sm">{t("blog", "relatedPosts")}</h3>
                <div className="space-y-4">
                  {related.map((rp) => (
                    <Link key={rp.id} to={`/blog/${rp.slug}`} className="group block">
                      <div className="flex gap-3">
                        <img src={rp.image} alt={rp.title} className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-medium text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {rp.title}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <Clock className="size-3" />{rp.readTime} phút
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Back to blog */}
            <Link
              to="/blog"
              className="flex items-center justify-center gap-2 w-full py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors bg-white"
            >
              <ArrowLeft className="size-4" />
              Xem tất cả bài viết
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
