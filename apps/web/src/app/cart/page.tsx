import type { Metadata } from "next";
import Cart from "@/figma/pages/Cart";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Gio hang",
  description: "Trang gio hang rieng tu va thanh toan khoa hoc.",
});

export default function Page() {
  return <Cart />;
}