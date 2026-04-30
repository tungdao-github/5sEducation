"use client";

import type { FormEvent } from "react";
import { ArrowRight, Award, Search, Zap } from "lucide-react";
import { Link } from "@/lib/router";
import type { Course } from "@/contexts/CartContext";
import { formatPriceCompact } from "@/services/api";
import { useI18n } from "@/app/providers";

type Props = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onSubmitSearch: (event: FormEvent<HTMLFormElement>) => void;
  featuredCourses: Course[];
  totalCourses: number;
};

export default function HomeHero({ searchQuery, setSearchQuery, onSubmitSearch, featuredCourses, totalCourses }: Props) {
  const { tx } = useI18n();

  return (
    <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm">
              <Zap className="size-4 fill-yellow-300 text-yellow-300" />
              <span className="text-blue-100">{tx("Over 50,000 learners are studying", "Hơn 50,000 học viên đang học")}</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl">
              {tx("Master UX/UI Design", "Làm chủ UX/UI Design")} <span className="text-yellow-300">{tx("starting today", "từ hôm nay")}</span>
            </h1>
            <p className="mb-8 text-xl leading-relaxed text-blue-100">
              {tx(
                "Learn from world-class experts. Practical content, valuable certificates, study anytime anywhere.",
                "Học từ những chuyên gia hàng đầu thế giới. Nội dung thực chiến, chứng chỉ có giá trị, học mọi lúc mọi nơi."
              )}
            </p>
            <form onSubmit={onSubmitSearch} className="mb-6 flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={tx("Search courses, instructors...", "Tìm kiếm khóa học, giảng viên...")}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full rounded-xl py-4 pl-12 pr-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <button type="submit" className="whitespace-nowrap rounded-xl bg-yellow-400 px-6 py-4 font-bold text-yellow-900 transition hover:bg-yellow-300">
                {tx("Search now", "Tìm ngay")}
              </button>
            </form>
            <div className="flex items-center gap-6 text-sm text-blue-200">
              <span>{tx("Gestalt Principles", "Gestalt Principles")}</span>
              <span>{tx("Microcopy", "Microcopy")}</span>
              <span>{tx("UX Analytics", "UX Analytics")}</span>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative">
              <div className="space-y-4 rounded-2xl bg-white/10 p-6 backdrop-blur">
                {featuredCourses.map((course) => (
                  <Link key={course.id} to={`/courses/${course.slug ?? course.id}`} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/10">
                    <img src={course.image} alt={course.title} className="h-10 w-14 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{course.title}</p>
                      <p className="text-xs text-blue-300">{course.instructor}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-yellow-300">{formatPriceCompact(course.price)}</p>
                      <p className="text-xs text-blue-300">★{course.rating}</p>
                    </div>
                  </Link>
                ))}
                <Link to="/search" className="flex items-center justify-center gap-2 py-2 text-sm text-blue-200 transition hover:text-white">
                  {tx("View all", "Xem tất cả")} {totalCourses} {tx("courses", "khóa học")} <ArrowRight className="size-4" />
                </Link>
              </div>

              <div className="absolute -right-4 -top-4 rounded-2xl bg-yellow-400 px-4 py-2 text-yellow-900 shadow-xl">
                <div className="flex items-center gap-2">
                  <Award className="size-5" />
                  <div>
                    <p className="text-sm font-bold">{tx("4.8★ rating", "4.8★ Đánh giá")}</p>
                    <p className="text-xs">{tx("From 1,284 learners", "Từ 1,284 học viên")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
