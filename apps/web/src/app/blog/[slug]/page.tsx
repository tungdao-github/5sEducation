import type { Metadata } from "next";
import BlogDetail from "@/figma/pages/BlogDetail";
import { API_URL } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";

type BlogSeoDto = {
  title: string;
  slug: string;
  summary?: string | null;
  content?: string | null;
  coverImageUrl?: string | null;
  authorName?: string | null;
  tags?: string[];
};

async function getPost(slug: string): Promise<BlogSeoDto | null> {
  try {
    const res = await fetch(`${API_URL}/api/blog/posts/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return buildMetadata({
      title: "Blog",
      description: "Bai viet UX/UI Design, nghien cuu nguoi dung va noi dung san pham.",
      path: `/blog/${slug}`,
      type: "article",
    });
  }

  return buildMetadata({
    title: post.title,
    description:
      post.summary ||
      post.content ||
      `Doc bai viet ${post.title} tren blog EduCourse.`,
    path: `/blog/${post.slug}`,
    image: post.coverImageUrl,
    type: "article",
    keywords: [...(post.tags ?? []), post.authorName || "EduCourse", "blog UX/UI"],
  });
}

export default function Page() {
  return <BlogDetail />;
}
