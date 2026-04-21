import type { Metadata } from "next";
import AdminDashboard from "@/figma/pages/AdminDashboard";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Quan ly khoa hoc",
  description: "Quan ly khoa hoc trong admin.",
});

export default function Page() {
  return <AdminDashboard initialTab="courses" />;
}