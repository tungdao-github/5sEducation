"use client";

import { Clock, Eye } from "lucide-react";
import { Link } from "@/lib/router";
import { safeBlogImage } from "@/components/blog/blogUtils";
import type { BlogPost } from "@/services/api";
import { useI18n } from "@/app/providers";

type Props = {
  posts: BlogPost[];
};

export default function BlogPostGrid({ posts }: Props) {
  const { tx } = useI18n();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <Link key={post.id} to={`/blog/${post.slug}`} className="group">
          <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
            <div className="aspect-video overflow-hidden">
              <img src={safeBlogImage(post.image)} alt={post.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
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
                <div className="flex items-center gap-1">
                  <Clock className="size-3" />
                    {post.readTime} {tx("min read", "phút")}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="size-3" />
                    {post.views.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
