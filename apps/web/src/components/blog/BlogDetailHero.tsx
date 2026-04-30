"use client";

import { ArrowLeft, Calendar, Clock, Eye } from "lucide-react";
import { Link } from "@/lib/router";
import type { BlogPost } from "@/services/api";
import { useI18n } from "@/app/providers";

type Props = {
  post: BlogPost;
  backLabel: string;
  formatDate: (value: string) => string;
};

export default function BlogDetailHero({ post, backLabel, formatDate }: Props) {
  const { tx } = useI18n();

  return (
    <div className="bg-[linear-gradient(135deg,#081221_0%,#1d4ed8_50%,#4f46e5_100%)] py-14 text-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link to="/blog" className="mb-6 inline-flex items-center gap-2 text-sm text-blue-200 transition-colors hover:text-white">
          <ArrowLeft className="size-4" />
          {backLabel}
        </Link>
        <div className="mb-4 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 backdrop-blur">
          {post.category}
        </div>
        <h1 className="mb-4 text-4xl font-semibold leading-snug tracking-[-0.04em] md:text-5xl">{post.title}</h1>
        <p className="mb-6 text-lg text-slate-200">{post.excerpt}</p>
        <div className="flex flex-wrap items-center gap-5 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2563eb,#7c3aed)] text-sm font-bold text-white">
              {post.author.charAt(0)}
            </div>
            <span className="font-medium text-white">{post.author}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="size-4" />
            {formatDate(post.date)}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="size-4" />
            {post.readTime} {tx("min read", "phút đọc")}
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="size-4" />
            {post.views.toLocaleString()} {tx("views", "lượt xem")}
          </div>
        </div>
      </div>
    </div>
  );
}
