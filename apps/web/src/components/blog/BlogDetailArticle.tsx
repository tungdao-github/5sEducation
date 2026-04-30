"use client";

import { Share2, Tag } from "lucide-react";
import { toast } from "@/lib/notify";
import BlogCommentsSection from "@/components/blog/BlogCommentsSection";
import { safeBlogImage, sanitizeBlogHtml } from "@/components/blog/blogUtils";
import type { BlogPost } from "@/services/api";
import { useI18n } from "@/app/providers";

type Props = {
  post: BlogPost;
  shareLink: string;
};

export default function BlogDetailArticle({ post, shareLink }: Props) {
  const { tx } = useI18n();

  return (
    <article className="lg:col-span-2">
      <div className="mb-8 overflow-hidden rounded-[32px] shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
        <img src={safeBlogImage(post.image)} alt={post.title} className="aspect-video w-full object-cover" />
      </div>

      <div
        className="prose prose-gray max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 prose-strong:text-gray-900 prose-ul:space-y-2 prose-li:text-gray-700"
        dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(post.content) }}
      />

      <div className="mt-8 border-t border-gray-200 pt-6">
        <div className="flex flex-wrap items-center gap-3">
          <Tag className="size-4 text-gray-400" />
          {post.tags.map((tag) => (
            <span key={tag} className="cursor-pointer rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 transition-colors hover:bg-blue-100 hover:text-blue-600">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Share2 className="size-4 text-blue-600" />
          {tx("Share article", "Chia sẻ bài viết")}
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`} target="_blank" rel="noreferrer" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
            Facebook
          </a>
          <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noreferrer" className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white">
            X
          </a>
          <button
            onClick={() => navigator.clipboard.writeText(shareLink).then(() => toast.success(tx("Link copied!", "Đã sao chép liên kết!")))}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {tx("Copy link", "Sao chép link")}
          </button>
        </div>
      </div>

      <BlogCommentsSection slug={post.slug} />
    </article>
  );
}
