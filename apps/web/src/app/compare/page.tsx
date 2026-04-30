import type { Metadata } from "next";
import Compare from "@/views/Compare";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "So sanh khoa hoc",
  description: "Trang so sanh khoa hoc va lo trinh hoc tap.",
});

export default function Page() {
  return <Compare />;
}


