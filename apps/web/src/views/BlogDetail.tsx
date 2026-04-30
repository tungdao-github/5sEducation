"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { useParams, Link } from "@/lib/router";
import { fetchBlogPostDetail, fetchBlogPosts, mapBlogPostDetail, mapBlogPostList, type BlogPost } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";
import BlogDetailHero from "@/components/blog/BlogDetailHero";
import BlogDetailSidebar from "@/components/blog/BlogDetailSidebar";
import BlogDetailArticle from "@/components/blog/BlogDetailArticle";

export default function BlogDetail() {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const load = async () => {
      try {
        const dto = await fetchBlogPostDetail(id, language);
        if (!active) return;
        const mappedPost = mapBlogPostDetail(dto, language);
        setPost(mappedPost);
        const list = await fetchBlogPosts({ take: 20, locale: language });
        if (!active) return;
        const mappedList = list.map((item) => mapBlogPostList(item, language));
        const relatedItems = mappedList.filter((item) => item.id !== mappedPost.id && item.category === mappedPost.category).slice(0, 3);
        setRelated(relatedItems);
      } catch {
        if (!active) return;
        setPost(null);
        setRelated([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [id, language]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(language === "vi" ? "vi-VN" : language === "fr" ? "fr-FR" : language === "es" ? "es-ES" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center bg-gray-50 text-gray-500">{t("blog", "loading")}</div>;
  }

  if (!post) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gray-50">
        <div className="text-center">
          <BookOpen className="mx-auto mb-3 size-12 text-gray-300" />
          <h2 className="mb-2 text-xl font-bold text-gray-700">{t("blog", "noPosts")}</h2>
          <Link to="/blog" className="text-sm text-blue-600 hover:underline">
            ← {t("blog", "backToBlog")}
          </Link>
        </div>
      </div>
    );
  }

  const shareLink = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <BlogDetailHero post={post} backLabel={t("blog", "backToBlog")} formatDate={formatDate} />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <BlogDetailArticle post={post} shareLink={shareLink} />
          <BlogDetailSidebar related={related} />
        </div>
      </div>
    </div>
  );
}
