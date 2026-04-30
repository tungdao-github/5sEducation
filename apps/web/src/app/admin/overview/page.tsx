import type { Metadata } from "next";
import AdminDashboard from "@/views/AdminDashboard";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Tong quan admin",
  description: "Trang tong quan quan tri EduCourse.",
});

export default function Page() {
  return <AdminDashboard initialTab="overview" />;
}

