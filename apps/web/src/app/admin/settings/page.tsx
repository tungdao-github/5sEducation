import type { Metadata } from "next";
import AdminDashboard from "@/figma/pages/AdminDashboard";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Cau hinh admin",
  description: "Cau hinh he thong trong admin.",
});

export default function Page() {
  return <AdminDashboard initialTab="config" />;
}