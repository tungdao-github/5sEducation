import type { Metadata } from "next";
import Home from "@/views/Home";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "EduCourse",
  description:
    "Nen tang hoc UX/UI Design online voi khoa hoc thuc chien, lo trinh hoc tap ro rang va blog chuyen sau.",
  path: "/",
  type: "website",
  keywords: ["EduCourse", "UX/UI Design", "khoa hoc online", "lo trinh hoc tap"],
});

export default function Page() {
  return <Home />;
}



