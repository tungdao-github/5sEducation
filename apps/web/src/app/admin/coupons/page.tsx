import type { Metadata } from "next";
import AdminDashboard from "@/views/AdminDashboard";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Ma giam gia",
  description: "Quan ly coupon va ma giam gia.",
});

export default function Page() {
  return <AdminDashboard initialTab="coupons" />;
}

