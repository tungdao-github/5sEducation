import type { Metadata } from "next";
import AdminDashboard from "@/figma/pages/AdminDashboard";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Quan ly blog",
  description: "Quan ly noi dung blog trong admin.",
});

export default function Page() {
  return <AdminDashboard initialTab="blog" />;
}