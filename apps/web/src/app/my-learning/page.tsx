import type { Metadata } from "next";
import MyLearning from "@/views/MyLearning";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Hoc tap cua toi",
  description: "Trang theo doi khoa hoc dang hoc va tien do ca nhan.",
});

export default function Page() {
  return <MyLearning />;
}


