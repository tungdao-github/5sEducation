import type { Metadata } from "next";
import AdminDashboard from "@/views/AdminDashboard";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Admin dashboard",
  description: "Bang dieu khien quan tri EduCourse.",
});

export default function AdminPage() {
  return <AdminDashboard initialTab="overview" />;
}

