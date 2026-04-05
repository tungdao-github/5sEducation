import Link from "next/link";
import { API_URL, resolveApiAsset } from "@/lib/api";
import { getServerLocale } from "@/lib/server-locale";
import { pickLocaleText } from "@/lib/i18n";

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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-gray-900 to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">{t("Blog & news", "Blog va tin tuc")}</h1>
          <p className="text-gray-300 mb-8">{t("UX, product, and learning insights.", "Chia se ve UX, san pham va hoc tap.")}</p>
          <form action="/blog" method="get" className="max-w-xl mx-auto relative">
            <input
              type="text"
              name="q"
              defaultValue={search}
              placeholder={t("Search articles...", "Tim bai viet...")}
              className="w-full pl-4 pr-4 py-3 rounded-xl text-gray-900 focus:outline-none"
            />
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!search && !tag && featuredPost && (
          <Link href={`/blog/${featuredPost.slug}`} className="block mb-12 group">
            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="aspect-[4/3] md:aspect-auto overflow-hidden">
                  {featuredPost.coverImageUrl ? (
                    <img
                      src={resolveApiAsset(featuredPost.coverImageUrl)}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 font-semibold">
                      {featuredPost.title}
                    </div>
                  )}
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full mb-4 w-fit">
                    {t("Featured", "Noi bat")}
                  </span>
                  <div className="text-xs text-blue-600 font-medium mb-2">
                    {(featuredPost.tags ?? [])[0] || t("News", "Tin tuc")}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">{featuredPost.summary}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{featuredPost.authorName || "5S Education"}</span>
                    <span>
                      {new Date(featuredPost.publishedAt ?? featuredPost.createdAt).toLocaleDateString(dateLocale, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 font-medium mt-4 group-hover:gap-2 transition-all">
                    {t("Read more", "Doc them")} ?
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Link
              href="/blog"
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                tag
                  ? "bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
                  : "bg-blue-600 text-white"
              }`}
            >
              {t("All", "Tat ca")}
            </Link>
            {allTags.map((tagItem) => (
              <Link
                key={tagItem}
                href={`/blog?${new URLSearchParams({ tag: tagItem }).toString()}`}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  tag === tagItem
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {tagItem}
              </Link>
            ))}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{t("No posts yet.", "Chua co bai viet.")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all h-full flex flex-col">
                  <div className="aspect-video overflow-hidden">
                    {post.coverImageUrl ? (
                      <img
                        src={resolveApiAsset(post.coverImageUrl)}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 font-semibold">
                        {post.title}
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="text-xs text-blue-600 font-medium mb-2">
                      {(post.tags ?? [])[0] || t("News", "Tin tuc")}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 flex-1">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{post.summary}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                      <span>{post.authorName || "5S Education"}</span>
                      <span>
                        {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString(dateLocale, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
