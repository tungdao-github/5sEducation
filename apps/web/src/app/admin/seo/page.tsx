import type { Metadata } from "next";
import AdminDashboard from "@/views/AdminDashboard";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "SEO",
  description: "Quan ly cau hinh SEO.",
});

export default function Page() {
  return <AdminDashboard initialTab="seo" />;
}

