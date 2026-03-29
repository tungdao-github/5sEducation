import Link from "next/link";
import { API_URL, resolveApiAsset } from "@/lib/api";
import { getServerLocale } from "@/lib/server-locale";
import { pickLocaleText } from "@/lib/i18n";
import { SearchSuggestInput } from "@/components/SearchSuggestInput";

interface BlogPostSummary {
  id: number;
  title: string;
  slug: string;
  summary: string;
  coverImageUrl: string;
  authorName: string;
  tags: string[];
  locale: string;
  publishedAt?: string | null;
  createdAt: string;
}

async function getPosts({
  search,
  tag,
  locale,
}: {
  search?: string;
  tag?: string;
  locale?: string;
}): Promise<BlogPostSummary[]> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (tag) params.set("tag", tag);
  if (locale) params.set("locale", locale);

  const url = params.toString()
    ? `${API_URL}/api/blog/posts?${params.toString()}`
    : `${API_URL}/api/blog/posts`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams:
    | {
        q?: string;
        tag?: string;
      }
    | Promise<{
        q?: string;
        tag?: string;
      }>;
}) {
  const locale = await getServerLocale();
  const t = (en: string, vi: string) => pickLocaleText(locale, en, vi);
  const resolvedParams = await Promise.resolve(searchParams);
  const search = resolvedParams.q ?? "";
  const tag = resolvedParams.tag ?? "";

  const posts = await getPosts({ search, tag, locale });
  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags ?? []))).slice(0, 12);
  const dateLocale = locale === "vi" ? "vi-VN" : "en-US";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-6 py-12 fade-in">
      <div className="space-y-3">
        <Link href="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {t("Home", "Trang chu")}
        </Link>
        <h1 className="section-title text-4xl font-semibold text-emerald-950">
          {t("Blog & news", "Tin tuc va chia se")}
        </h1>
        <p className="text-sm text-emerald-800/70">
          {t(
            "Product updates, learning tips, and stories from the 5S Education team.",
            "Cap nhat san pham, meo hoc tap, va chuyen tu doi ngu 5S Education."
          )}
        </p>
      </div>

      <div className="glass-card space-y-4 rounded-3xl p-6">
        <form action="/blog" method="get" className="flex flex-col gap-3">
          <SearchSuggestInput
            name="q"
            defaultValue={search}
            placeholder={t("Search posts", "Tim bai viet")}
            className="flex-1"
            inputClassName="flex-1 rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm text-emerald-950 focus:outline-none"
            enableVoice
          />
          <input
            name="tag"
            defaultValue={tag}
            placeholder={t("Filter by tag", "Loc theo tag")}
            className="rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-emerald-700 px-6 py-2 text-sm font-semibold text-white sm:w-auto"
          >
            {t("Search", "Tim")}
          </button>
        </form>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Link
              href="/blog"
              className={`rounded-full border px-4 py-1 text-xs font-semibold ${
                tag ? "border-emerald-100 text-emerald-800" : "border-emerald-300 bg-emerald-700 text-white"
              }`}
            >
              {t("All topics", "Tat ca chu de")}
            </Link>
            {allTags.map((tagItem) => (
              <Link
                key={tagItem}
                href={`/blog?${new URLSearchParams({ tag: tagItem }).toString()}`}
                className={`rounded-full border px-4 py-1 text-xs font-semibold ${
                  tag === tagItem
                    ? "border-emerald-300 bg-emerald-700 text-white"
                    : "border-emerald-100 text-emerald-800"
                }`}
              >
                {tagItem}
              </Link>
            ))}
          </div>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="glass-card rounded-3xl p-10 text-center text-sm text-emerald-800/70">
          {t("No posts yet. Try again soon.", "Chua co bai viet. Thu lai sau.")}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white/80 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-48 w-full overflow-hidden bg-emerald-50">
                {post.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveApiAsset(post.coverImageUrl)}
                    alt={post.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-100 via-white to-emerald-200 text-xs font-semibold text-emerald-700">
                    5S Education
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  <span>{post.authorName || "5S Education"}</span>
                  <span>-</span>
                  <span>
                    {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString(dateLocale, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-emerald-950">{post.title}</h3>
                <p className="text-sm text-emerald-800/70">{post.summary}</p>
                <div className="mt-auto flex flex-wrap gap-2">
                  {(post.tags ?? []).slice(0, 4).map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-emerald-100 bg-white px-3 py-1 text-[11px] font-semibold text-emerald-800"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
