import type { Metadata } from "next";
import Checkout from "@/figma/pages/Checkout";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Thanh toan",
  description: "Trang thanh toan khoa hoc va hoan tat don hang.",
});

export default function Page() {
  return <Checkout />;
}