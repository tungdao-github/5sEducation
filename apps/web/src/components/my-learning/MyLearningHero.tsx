"use client";

import type { ReactNode } from "react";
import { Award, BookOpen, CheckCircle, TrendingUp } from "lucide-react";

type Props = {
  totalCourses: number;
  inProgressCourses: number;
  completedCourses: number;
};

function StatCard({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="size-8">{icon}</div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-blue-100">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function MyLearningHero({ totalCourses, inProgressCourses, completedCourses }: Props) {
  return (
    <section className="bg-[linear-gradient(135deg,#081221_0%,#1d4ed8_50%,#4f46e5_100%)] py-14 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-semibold tracking-[-0.04em] md:text-5xl">Khóa học của tôi</h1>
        <p className="mt-3 text-lg text-slate-200">Tiếp tục hành trình học tập của bạn</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard icon={<BookOpen className="size-8" />} value={totalCourses} label="Tổng khóa học" />
          <StatCard icon={<TrendingUp className="size-8" />} value={inProgressCourses} label="Đang học" />
          <StatCard icon={<CheckCircle className="size-8" />} value={completedCourses} label="Hoàn thành" />
        </div>
      </div>
    </section>
  );
}
