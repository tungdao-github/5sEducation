import Search from "@/figma/pages/Search";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Danh sach khoa hoc",
  description: "Tim kiem va kham pha cac khoa hoc UX/UI Design, nghien cuu UX va noi dung san pham.",
  path: "/courses",
  type: "website",
  keywords: ["khoa hoc UX/UI", "danh sach khoa hoc", "EduCourse"],
});

export default function Page() {
  return <Search />;
}
