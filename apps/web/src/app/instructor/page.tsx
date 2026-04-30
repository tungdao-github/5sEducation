import type { Metadata } from "next";
import InstructorDashboard from "@/views/InstructorDashboard";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Giang vien",
  description: "Bang dieu khien giang vien tren EduCourse.",
});

export default function Page() {
  return <InstructorDashboard />;
}


