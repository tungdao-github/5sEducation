import type { Metadata } from "next";
import AdminDashboard from "@/views/AdminDashboard";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Quan ly nguoi dung",
  description: "Quan ly nguoi dung trong admin.",
});

export default function Page() {
  return <AdminDashboard initialTab="users" />;
}

