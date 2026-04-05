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
  const featuredPost = posts[0];
  const restPosts = posts.slice(1);

  return (
    <div className="section-shell space-y-10 py-12 fade-in">
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
        <div className="flex flex-wrap gap-3 text-sm text-emerald-800/70">
          <div className="stat-pill">
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-emerald-700">
              {t("Articles", "Bai viet")}
            </span>
            <span className="text-sm font-semibold text-emerald-950">{posts.length}</span>
          </div>
          <div className="stat-pill">
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-emerald-700">
              {t("Topics", "Chu de")}
            </span>
            <span className="text-sm font-semibold text-emerald-950">{allTags.length}</span>
          </div>
        </div>
      </div>

      <div className="surface-card space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {t("Filters", "Bo loc")}
            </p>
            <h2 className="section-title text-2xl font-semibold text-emerald-950">
              {t("Find stories that matter", "Tim bai viet phu hop")}
            </h2>
            <p className="text-sm text-emerald-800/70">
              {t("Search by topic, tag, or keyword.", "Tim theo chu de, tag, hoac tu khoa.")}
            </p>
          </div>
          <div className="stat-pill">
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-emerald-700">
              {t("Active tag", "Tag dang chon")}
            </span>
            <span className="text-sm font-semibold text-emerald-950">{tag || t("All", "Tat ca")}</span>
          </div>
        </div>

        <form action="/blog" method="get" className="grid gap-3 md:grid-cols-[1.5fr_1fr_auto] md:items-end">
          <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            <span>{t("Search", "Tim kiem")}</span>
            <SearchSuggestInput
              name="q"
              defaultValue={search}
              placeholder={t("Search posts", "Tim bai viet")}
              className="flex-1"
              inputClassName="w-full rounded-full border border-[color:var(--stroke)] bg-white px-4 py-2 text-sm text-emerald-950 focus:outline-none"
              enableVoice
            />
          </label>
          <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            <span>{t("Tag", "Tag")}</span>
            <input
              name="tag"
              defaultValue={tag}
              placeholder={t("Filter by tag", "Loc theo tag")}
              className="w-full rounded-full border border-[color:var(--stroke)] bg-white px-4 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-emerald-700 px-6 py-2 text-sm font-semibold text-white"
          >
            {t("Search", "Tim")}
          </button>
        </form>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Link
              href="/blog"
              className={`rounded-full border px-4 py-1 text-xs font-semibold ${
                tag ? "border-[color:var(--stroke)] text-emerald-800" : "border-[color:var(--brand)] bg-emerald-700 text-white"
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
                    ? "border-[color:var(--brand)] bg-emerald-700 text-white"
                    : "border-[color:var(--stroke)] text-emerald-800"
                }`}
              >
                {tagItem}
              </Link>
            ))}
          </div>
        )}
      </div>

      {featuredPost && (
        <section className="surface-card overflow-hidden">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="relative min-h-[220px] bg-[color:var(--brand-soft)]">
              {featuredPost.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveApiAsset(featuredPost.coverImageUrl)}
                  alt={featuredPost.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-emerald-700">
                  5S Education
                </div>
              )}
            </div>
            <div className="space-y-4 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                {t("Featured story", "Bai viet noi bat")}
              </p>
              <h2 className="text-2xl font-semibold text-emerald-950">{featuredPost.title}</h2>
              <p className="text-sm text-emerald-800/70">{featuredPost.summary}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-emerald-800/70">
                <span>{featuredPost.authorName || "5S Education"}</span>
                <span>-</span>
                <span>
                  {new Date(featuredPost.publishedAt ?? featuredPost.createdAt).toLocaleDateString(dateLocale, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(featuredPost.tags ?? []).slice(0, 3).map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[color:var(--stroke)] bg-white px-3 py-1 text-[11px] font-semibold text-emerald-800"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="inline-flex rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white"
              >
                {t("Read article", "Doc bai viet")}
              </Link>
            </div>
          </div>
        </section>
      )}

      {posts.length === 0 ? (
        <div className="surface-card p-10 text-center text-sm text-emerald-800/70">
          {t("No posts yet. Try again soon.", "Chua co bai viet. Thu lai sau.")}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {restPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[color:var(--stroke)] bg-white/80 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-48 w-full overflow-hidden bg-[color:var(--brand-soft)]">
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
                      className="rounded-full border border-[color:var(--stroke)] bg-white px-3 py-1 text-[11px] font-semibold text-emerald-800"
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


