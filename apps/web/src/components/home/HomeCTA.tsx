"use client";

import { Play, TrendingUp } from "lucide-react";
import { Link } from "@/lib/router";
import { useI18n } from "@/app/providers";

export default function HomeCTA() {
  const { tx } = useI18n();

  return (
    <>
      <section className="border-y border-blue-100 bg-blue-50 py-10">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h3 className="mb-2 text-xl font-bold text-gray-900">{tx("Not sure which course to choose?", "Chưa biết chọn khóa học nào?")}</h3>
          <p className="mb-5 text-gray-600">{tx("Use the compare tool to find the best fit for you", "Sử dụng tính năng so sánh để tìm khóa học phù hợp nhất với bạn")}</p>
          <Link to="/compare" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700">
            <TrendingUp className="size-5" />
            {tx("Compare courses", "So sánh khóa học")}
          </Link>
        </div>
      </section>

      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-white/20">
            <Play className="size-8 fill-white" />
          </div>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">{tx("Start your learning journey today", "Bắt đầu hành trình học tập ngay hôm nay")}</h2>
          <p className="mb-8 text-xl text-blue-100">{tx("Join 50,000+ learners growing their UX/UI careers", "Tham gia cùng 50,000+ học viên đang phát triển sự nghiệp UX/UI Design")}</p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/search" className="rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-blue-600 transition hover:bg-blue-50">
              {tx("Explore courses", "Khám phá khóa học")}
            </Link>
            <Link to="/compare" className="rounded-xl border-2 border-white px-8 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">
              {tx("Compare courses", "So sánh khóa học")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
