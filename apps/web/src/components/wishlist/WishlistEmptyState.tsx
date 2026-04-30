"use client";

import { ArrowRight, Heart } from "lucide-react";
import { Link } from "@/lib/router";
import { useI18n } from "@/app/providers";

export default function WishlistEmptyState() {
  const { tx } = useI18n();

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <div className="max-w-md rounded-[28px] border border-slate-200 bg-white px-6 py-10 text-center shadow-[0_20px_70px_rgba(15,23,42,0.12)]">
        <Heart className="mx-auto mb-4 size-16 fill-rose-500 text-rose-500" />
        <h2 className="mb-2 text-2xl font-semibold text-slate-950">{tx("No favorite courses yet", "Chưa có khóa học yêu thích")}</h2>
        <p className="mb-6 text-slate-500">{tx("Add courses you like to find them easily later.", "Hãy thêm những khóa học bạn thích để dễ dàng tìm lại sau!")}</p>
        <Link to="/" className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700">
          {tx("Explore courses", "Khám phá khóa học")} <ArrowRight className="size-5" />
        </Link>
      </div>
    </div>
  );
}
