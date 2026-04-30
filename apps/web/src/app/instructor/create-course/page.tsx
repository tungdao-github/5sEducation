import type { Metadata } from "next";
import CourseCreator from "@/views/CourseCreator";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Tao khoa hoc",
  description: "Tao va chinh sua khoa hoc moi.",
});

export default function Page() {
  return <CourseCreator />;
}


