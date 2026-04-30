import type { Metadata } from "next";
import Wishlist from "@/views/Wishlist";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Yeu thich",
  description: "Trang luu khoa hoc yeu thich cua ban.",
});

export default function Page() {
  return <Wishlist />;
}


