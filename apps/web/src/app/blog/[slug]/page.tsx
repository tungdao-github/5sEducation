import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { API_URL, resolveApiAsset } from "@/lib/api";
import { getServerLocale } from "@/lib/server-locale";
import { pickLocaleText } from "@/lib/i18n";

interface BlogPostDetail {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageUrl: string;
  authorName: string;
  tags: string[];
  locale: string;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

async function fetchPost(slug: string): Promise<BlogPostDetail | null> {
  try {
    const res = await fetch(`${API_URL}/api/blog/posts/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchPostById(id: number): Promise<BlogPostDetail | null> {
  try {
    const res = await fetch(`${API_URL}/api/blog/posts/by-id/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await fetchPost(params.slug);
  if (!post) {
    return {
      title: "Blog",
      description: "5S Education blog",
    };
  }

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.summary;
  const imageUrl = post.coverImageUrl ? resolveApiAsset(post.coverImageUrl) : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug?: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug ?? "";
  if (!slug) {
    notFound();
  }

  const post = await fetchPost(slug);
  if (!post) {
    const idMatch = slug.match(/^(\d+)/);
    if (idMatch) {
      const id = Number(idMatch[1]);
      if (!Number.isNaN(id)) {
        const byId = await fetchPostById(id);
        if (byId?.slug) {
          redirect(`/blog/${byId.slug}`);
        }
      }
    }
  }
  if (!post) {
    notFound();
  }

  const locale = await getServerLocale();
  const t = (en: string, vi: string) => pickLocaleText(locale, en, vi);
  const dateLocale = locale === "vi" ? "vi-VN" : "en-US";
  const wordCount = post.content?.trim().split(/\s+/).filter(Boolean).length ?? 0;
  const readMinutes = Math.max(1, Math.round(wordCount / 200));
  const tag = post.tags?.[0] || t("News", "Tin tuc");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-gray-900 to-blue-900 text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors text-sm mb-6">
            ? {t("Back to blog", "Quay lai blog")}
          </Link>
          <div className="inline-block bg-blue-500/30 text-blue-200 text-xs font-medium px-3 py-1 rounded-full mb-4">
            {tag}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-snug">{post.title}</h1>
          <p className="text-gray-300 text-lg mb-6">{post.summary}</p>
          <div className="flex flex-wrap items-center gap-5 text-sm text-gray-300">
            <span className="text-white font-medium">{post.authorName || "5S Education"}</span>
            <span>
              {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString(dateLocale, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span>{readMinutes} {t("min read", "phut doc")}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          <article className="lg:col-span-2">
            {post.coverImageUrl ? (
              <div className="rounded-2xl overflow-hidden mb-8 shadow-md">
                <img
                  src={resolveApiAsset(post.coverImageUrl)}
                  alt={post.title}
                  className="w-full aspect-video object-cover"
                />
              </div>
            ) : null}

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="whitespace-pre-line text-gray-700 leading-relaxed text-sm">
                {post.content}
              </div>
            </div>

            {post.tags?.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 flex-wrap">
                  {post.tags.map((item) => (
                    <span key={item} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                      #{item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>

          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">{t("About the author", "Tac gia")}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {post.authorName || "5S Education"}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">{t("Keep learning", "Tiep tuc hoc")}</h3>
              <p className="text-xs text-gray-600 mb-4">
                {t("Explore curated courses to apply these ideas.", "Kham pha khoa hoc de ap dung y tuong nay.")}
              </p>
              <Link
                href="/courses"
                className="inline-flex w-full justify-center bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                {t("Browse courses", "Xem khoa hoc")}
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
