"use client";

import { MessageCircle, Send, ThumbsUp } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createBlogComment, fetchBlogComments, toggleBlogCommentLike, type BlogComment } from "@/services/api";
import { toast } from "@/lib/notify";
import { useI18n } from "@/app/providers";

type Props = {
  slug: string;
};

export default function BlogCommentsSection({ slug }: Props) {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { tx, locale } = useI18n();
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

  const handleSubmit = async (e: FormEvent) => {
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
      toast.success(tx("Comment posted!", "Đã đăng bình luận!"));
    } catch {
      toast.error(tx("Unable to post comment.", "Không thể đăng bình luận."));
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
        prev.map((c) => (c.id === id ? { ...c, likeCount: res.likeCount, isLikedByUser: res.isLiked } : c))
      );
    } catch {
      toast.error(tx("Unable to update likes.", "Không thể cập nhật lượt thích."));
    }
  };

  return (
    <div className="mt-10 border-t border-gray-200 pt-8">
      <div className="mb-6 flex items-center gap-3">
        <MessageCircle className="size-5 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-900">
          {tx("Comments", "Bình luận")} ({comments.length})
        </h3>
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
              placeholder={
                isAuthenticated
                  ? tx("Share your thoughts about this article...", "Chia sẻ suy nghĩ của bạn về bài viết này...")
                  : tx("Sign in to comment", "Đăng nhập để bình luận")
              }
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-2 flex justify-end">
              <button type="submit" disabled={!newComment.trim()} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">
                <Send className="size-4" />
                {tx("Post comment", "Đăng bình luận")}
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="space-y-5">
        {loading ? <p className="text-sm text-gray-500">{tx("Loading comments...", "Đang tải bình luận...")}</p> : null}
        {!loading && comments.length === 0 ? <p className="text-sm text-gray-500">{tx("No comments yet.", "Chưa có bình luận nào.")}</p> : null}
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#94a3b8,#64748b)] text-sm font-bold text-white">
              {comment.authorName?.charAt(0) || "?"}
            </div>
            <div className="flex-1">
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">{comment.authorName}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString(locale === "vi" ? "vi-VN" : locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : "en-US")}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-gray-700">{comment.content}</p>
              </div>
              <div className="mt-2 flex items-center gap-3 pl-2">
                <button
                  onClick={() => handleLike(comment.id)}
                  className={`flex items-center gap-1.5 text-xs transition ${comment.isLikedByUser ? "font-medium text-blue-600" : "text-gray-400 hover:text-blue-600"}`}
                >
                  <ThumbsUp className={`size-3.5 ${comment.isLikedByUser ? "fill-blue-600" : ""}`} />
                  {comment.likeCount} {tx("likes", "thích")}
                </button>
                <button className="text-xs text-gray-400 transition hover:text-blue-600">{tx("Reply", "Trả lời")}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
