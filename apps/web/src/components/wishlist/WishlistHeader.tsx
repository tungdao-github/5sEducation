"use client";

import { Heart } from "lucide-react";
import { useI18n } from "@/app/providers";

type Props = {
  count: number;
};

export default function WishlistHeader({ count }: Props) {
  const { tx } = useI18n();

  return (
    <div className="mb-8 flex items-center gap-3">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
        <Heart className="size-5 fill-rose-500" />
      </div>
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950">{tx("Wishlist", "Khóa học yêu thích")}</h1>
        <p className="text-sm text-slate-500">{count} {tx("saved courses", "khóa học đã lưu")}</p>
      </div>
    </div>
  );
}
