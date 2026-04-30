import type { Metadata } from "next";
import CourseCreator from "@/views/CourseCreator";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Tao khoa hoc",
  description: "Tao khoa hoc moi trong studio giang vien.",
});

export default function Page() {
  return <CourseCreator />;
}

