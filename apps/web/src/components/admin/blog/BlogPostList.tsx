"use client";

import { Calendar, Clock, Edit, Eye, Trash2 } from "lucide-react";
import { useI18n } from "@/app/providers";
import type { BlogPostAdminDto } from "@/services/api";
import { toIntlLocale } from "@/components/admin/adminLocale";

type Props = {
  posts: BlogPostAdminDto[];
  loading: boolean;
  search: string;
  onEdit: (post: BlogPostAdminDto) => void;
  onDelete: (id: number) => void;
};

export default function BlogPostList({ posts, loading, search, onEdit, onDelete }: Props) {
  const { tx, locale } = useI18n();
  const filtered = posts.filter((post) => {
    const term = search.toLowerCase();
    return (
      post.title.toLowerCase().includes(term) ||
      post.authorName.toLowerCase().includes(term) ||
      (post.tags || []).some((tag) => tag.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-3">
      {loading ? <p className="text-sm text-gray-500">{tx("Loading posts...", "Đang tải bài viết...")}</p> : null}

      {filtered.map((post) => {
        const published = post.isPublished ?? Boolean(post.publishedAt);
        return (
          <div key={post.id} className="rounded-xl border border-gray-200 bg-white p-4 transition hover:border-blue-200">
            <div className="flex gap-4">
              <img
                src={post.coverImageUrl || "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800"}
                alt={post.title}
                className="h-16 w-20 flex-shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      {(post.tags || []).slice(0, 2).map((tag) => (
                        <span key={tag} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {tag}
                        </span>
                      ))}
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {published ? tx("Published", "Xuất bản") : tx("Draft", "Bản nháp")}
                      </span>
                    </div>
                    <h3 className="line-clamp-1 text-sm font-semibold text-gray-900">{post.title}</h3>
                    <p className="mt-1 line-clamp-1 text-xs text-gray-500">{post.summary}</p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1">
                    <button onClick={() => onEdit(post)} className="rounded p-1.5 text-blue-600 transition hover:bg-blue-50">
                      <Edit className="size-4" />
                    </button>
                    <button onClick={() => onDelete(post.id)} className="rounded p-1.5 text-red-500 transition hover:bg-red-50">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                  <span>{post.authorName}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {new Date(post.createdAt).toLocaleDateString(toIntlLocale(locale))}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {post.summary ? Math.max(1, Math.round(post.summary.length / 350)) : 1} {tx("min", "phút")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="size-3" />
                    {published ? tx("Published", "Xuất bản") : tx("Draft", "Bản nháp")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {!loading && filtered.length === 0 ? <div className="py-10 text-center text-gray-400">{tx("No posts yet.", "Không có bài viết.")}</div> : null}
    </div>
  );
}
