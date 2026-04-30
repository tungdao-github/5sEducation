import type { Metadata } from "next";
import OrderTracking from "@/views/OrderTracking";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Theo doi don hang",
  description: "Trang theo doi don hang va hoa don cua ban.",
});

export default function Page() {
  return <OrderTracking />;
}


