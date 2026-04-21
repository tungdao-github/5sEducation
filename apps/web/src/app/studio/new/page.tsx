import type { Metadata } from "next";
import CourseCreator from "@/figma/pages/CourseCreator";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Tao khoa hoc",
  description: "Tao khoa hoc moi trong studio giang vien.",
});

export default function Page() {
  return <CourseCreator />;
}