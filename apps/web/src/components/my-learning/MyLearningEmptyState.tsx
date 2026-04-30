"use client";

import { BookOpen } from "lucide-react";
import { Link } from "@/lib/router";
import { useI18n } from "@/app/providers";

export default function MyLearningEmptyState() {
  const { tx } = useI18n();

  return (
    <div className="rounded-[28px] border border-dashed border-slate-200 bg-white py-16 text-center shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <BookOpen className="mx-auto mb-4 size-20 text-slate-300" />
      <h2 className="mb-2 text-2xl font-semibold text-slate-950">{tx("No courses yet", "Chưa có khóa học nào")}</h2>
      <p className="mb-6 text-slate-600">{tx("You haven't purchased any course yet. Discover our quality courses!", "Bạn chưa mua khóa học nào. Khám phá các khóa học chất lượng của chúng tôi!")}</p>
      <Link to="/" className="inline-block rounded-2xl bg-slate-900 px-8 py-3 text-white transition hover:bg-slate-700">
        {tx("Explore courses", "Khám phá khóa học")}
      </Link>
    </div>
  );
}
