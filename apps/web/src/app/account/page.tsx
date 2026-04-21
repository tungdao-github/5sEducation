import type { Metadata } from "next";
import Account from "@/figma/pages/Account";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Tai khoan",
  description: "Trang tai khoan ca nhan va quan ly thong tin nguoi dung.",
});

export default function Page() {
  return <Account />;
}