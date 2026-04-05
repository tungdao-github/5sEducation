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

  return (
    <div className="section-shell space-y-10 py-12 fade-in">
      <div className="space-y-3">
        <Link href="/blog" className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {t("Back to blog", "Quay lai blog")}
        </Link>
        <h1 className="section-title text-4xl font-semibold text-emerald-950">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-emerald-800/70">
          <span>{post.authorName || "5S Education"}</span>
          <span>-</span>
          <span>
            {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString(dateLocale, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span>-</span>
          <span>{t("Read", "Doc")}: {readMinutes} {t("min", "phut")}</span>
        </div>
        <p className="text-sm text-emerald-800/70">{post.summary}</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="space-y-6">
          {post.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveApiAsset(post.coverImageUrl)}
              alt={post.title}
              className="h-72 w-full rounded-3xl object-cover"
            />
          ) : null}

          <div className="surface-card space-y-4 p-8 text-sm text-emerald-900">
            <div className="whitespace-pre-line leading-relaxed">{post.content}</div>
          </div>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="surface-card space-y-3 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {t("Article details", "Thong tin bai viet")}
            </p>
            <div className="space-y-2 text-sm text-emerald-900">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                  {t("Author", "Tac gia")}
                </p>
                <p className="font-semibold">{post.authorName || "5S Education"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                  {t("Published", "Xuat ban")}
                </p>
                <p>
                  {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString(dateLocale, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                  {t("Reading time", "Thoi gian doc")}
                </p>
                <p>{readMinutes} {t("minutes", "phut")}</p>
              </div>
            </div>
          </div>

          <div className="surface-card space-y-3 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {t("Topics", "Chu de")}
            </p>
            <div className="flex flex-wrap gap-2">
              {(post.tags ?? []).length === 0 && (
                <span className="text-xs text-emerald-700/70">{t("No tags yet.", "Chua co tag.")}</span>
              )}
              {post.tags?.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[color:var(--stroke)] bg-white px-3 py-1 text-[11px] font-semibold text-emerald-800"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="surface-card space-y-3 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {t("Keep learning", "Tiep tuc hoc")}
            </p>
            <p className="text-sm text-emerald-800/70">
              {t(
                "Explore curated courses to apply these ideas in practice.",
                "Kham pha khoa hoc de ap dung cac y tuong nay vao thuc te."
              )}
            </p>
            <Link
              href="/courses"
              className="inline-flex rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white"
            >
              {t("Browse courses", "Xem khoa hoc")}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
