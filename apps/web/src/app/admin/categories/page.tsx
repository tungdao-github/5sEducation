import type { Metadata } from "next";
import AdminDashboard from "@/figma/pages/AdminDashboard";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Danh muc",
  description: "Quan ly danh muc khoa hoc.",
});

export default function Page() {
  return <AdminDashboard initialTab="categories" />;
}