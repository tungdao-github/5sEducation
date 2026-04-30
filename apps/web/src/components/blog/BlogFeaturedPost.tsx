"use client";

import { ChevronRight, Clock, Eye } from "lucide-react";
import { Link } from "@/lib/router";
import { safeBlogImage } from "@/components/blog/blogUtils";
import type { BlogPost } from "@/services/api";
import { useI18n } from "@/app/providers";

type Props = {
  post: BlogPost;
  readMoreLabel: string;
};

export default function BlogFeaturedPost({ post, readMoreLabel }: Props) {
  const { tx } = useI18n();

  return (
    <Link to={`/blog/${post.slug}`} className="group mb-12 block">
      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-[0_30px_90px_rgba(15,23,42,0.12)]">
        <div className="grid gap-0 md:grid-cols-2">
          <div className="aspect-[4/3] overflow-hidden md:aspect-auto">
            <img src={safeBlogImage(post.image)} alt={post.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
          </div>
          <div className="flex flex-col justify-center p-8">
            <span className="mb-4 inline-block w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              ⭐ {tx("Featured article", "Bài viết nổi bật")}
            </span>
            <div className="mb-2 text-xs font-medium text-blue-600">{post.category}</div>
            <h2 className="mb-3 text-2xl font-semibold text-slate-950 transition-colors group-hover:text-blue-600">{post.title}</h2>
            <p className="mb-4 line-clamp-3 text-slate-600">{post.excerpt}</p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>{post.author}</span>
              <div className="flex items-center gap-1">
                <Clock className="size-4" />
                {post.readTime} {tx("min read", "phút đọc")}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="size-4" />
                {post.views.toLocaleString()}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 font-medium text-blue-600 transition-all group-hover:gap-2">
              {readMoreLabel} <ChevronRight className="size-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
