import type { Metadata } from "next";
import AdminDashboard from "@/figma/pages/AdminDashboard";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Nhat ky",
  description: "Lich su hoat dong he thong.",
});

export default function Page() {
  return <AdminDashboard initialTab="logs" />;
}