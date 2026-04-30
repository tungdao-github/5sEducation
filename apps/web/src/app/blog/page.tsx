import Blog from "@/views/Blog";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Blog UX/UI",
  description: "Bai viet ve UX/UI Design, nghien cuu nguoi dung, microcopy va phan tich san pham.",
  path: "/blog",
  type: "website",
  keywords: ["blog UX/UI", "microcopy", "nghien cuu UX", "EduCourse"],
});

export default function Page() {
  return <Blog />;
}


