import type { Metadata } from "next";
import BecomeInstructor from "@/views/BecomeInstructor";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Tro thanh giang vien",
  description: "Dang ky tro thanh giang vien tren EduCourse.",
});

export default function Page() {
  return <BecomeInstructor />;
}


