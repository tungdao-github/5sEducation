import type { Metadata } from "next";
import AdminDashboard from "@/figma/pages/AdminDashboard";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Giang vien",
  description: "Quan ly giang vien trong admin.",
});

export default function Page() {
  return <AdminDashboard initialTab="instructors" />;
}