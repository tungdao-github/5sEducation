"use client";

import { ArrowRight, ShoppingBag } from "lucide-react";
import { Link } from "@/lib/router";

export default function CartEmptyState() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4">
      <div className="max-w-md rounded-[28px] border border-slate-200 bg-white px-6 py-10 text-center shadow-[0_20px_70px_rgba(15,23,42,0.12)]">
        <ShoppingBag className="mx-auto mb-4 size-16 text-slate-300" />
        <h2 className="mb-2 text-2xl font-semibold text-slate-950">Giỏ hàng trống</h2>
        <p className="mb-6 text-slate-600">
          Bạn chưa thêm khóa học nào vào giỏ hàng. Hãy khám phá các khóa học tuyệt vời của chúng tôi!
        </p>
        <Link to="/" className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700">
          Khám phá khóa học <ArrowRight className="size-5" />
        </Link>
      </div>
    </div>
  );
}
