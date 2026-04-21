import Search from "@/figma/pages/Search";
import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Tim kiem khoa hoc",
  description: "Trang ket qua tim kiem khoa hoc trong EduCourse.",
});

export default function Page() {
  return <Search />;
}
