import type { Metadata } from "next";
import OrderTracking from "@/figma/pages/OrderTracking";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Don hang",
  description: "Trang danh sach don hang va lich su mua khoa hoc.",
});

export default function Page() {
  return <OrderTracking />;
}