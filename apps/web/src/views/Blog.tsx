"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchBlogPosts, mapBlogPostList, type BlogPost } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";
import BlogHero from "@/components/blog/BlogHero";
import BlogCategoryFilters from "@/components/blog/BlogCategoryFilters";
import BlogFeaturedPost from "@/components/blog/BlogFeaturedPost";
import BlogPostGrid from "@/components/blog/BlogPostGrid";
import BlogEmptyState from "@/components/blog/BlogEmptyState";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function Blog() {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchBlogPosts({ take: 50, locale: language })
      .then((data) => {
        if (!active) return;
        setPosts(data.map((dto) => mapBlogPostList(dto, language)));
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
  }, [language]);

  const categories = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach((post) => {
      if (post.category) tags.add(post.category);
    });
    return [
      { value: "all", label: t("common", "all") },
      ...Array.from(tags).map((label) => ({
        value: slugify(label),
        label,
      })),
    ];
  }, [posts, t]);

  const filtered = posts.filter((post) => {
    const matchCategory = category === "all" || slugify(post.category) === category;
    const matchSearch = !search || post.title.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const featured = posts[0];

  useEffect(() => {
    setCategory("all");
  }, [language]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <BlogHero title={t("blog", "title")} search={search} onSearchChange={setSearch} />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {!loading && featured && !search && category === "all" ? <BlogFeaturedPost post={featured} readMoreLabel={t("blog", "readMore")} /> : null}

        <BlogCategoryFilters categories={categories} activeCategory={category} onSelect={setCategory} />

        {loading ? (
          <div className="py-12 text-center text-gray-500">{t("blog", "loading")}</div>
        ) : filtered.length > 0 ? (
          <BlogPostGrid posts={filtered} />
        ) : (
          <BlogEmptyState message={t("blog", "noPosts")} />
        )}
      </div>
    </div>
  );
}
