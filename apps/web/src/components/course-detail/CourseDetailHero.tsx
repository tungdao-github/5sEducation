"use client";

import { Award, BookOpen, Check, Clock, PlayCircle, ShoppingCart, Star, Users } from "lucide-react";
import { Link } from "@/lib/router";
import { formatPrice } from "@/services/api";
import type { Course } from "@/contexts/CartContext";

const IMAGE_FALLBACK = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#0f172b"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <circle cx="1040" cy="160" r="220" fill="rgba(255,255,255,0.08)"/>
    <circle cx="240" cy="560" r="180" fill="rgba(255,255,255,0.06)"/>
    <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" fill="#e2e8f0" font-family="Arial, Helvetica, sans-serif" font-size="42">EduCourse</text>
  </svg>`
)}`;

function safeImage(src?: string | null) {
  return src && src.trim().length > 0 ? src : IMAGE_FALLBACK;
}

type Props = {
  course: Course;
  totalLessons: number;
  inCart: boolean;
  onAddToCart: () => void;
};

export default function CourseDetailHero({ course, totalLessons, inCart, onAddToCart }: Props) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#081221_0%,#0f1c3a_52%,#07111f_100%)] py-14 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.22),transparent_24%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.18),transparent_22%)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-100 shadow-lg backdrop-blur">
              <span className="size-2 rounded-full bg-sky-300" />
              {course.category}
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.04em] md:text-5xl">
              {course.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">{course.description}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur">
                <Star className="size-4 fill-yellow-300 text-yellow-300" />
                <span className="font-semibold text-white">{course.rating}</span>
                <span className="text-slate-300">({course.students.toLocaleString()} học viên)</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur">
                <Clock className="size-4" />
                <span className="text-slate-100">{course.duration}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur">
                <span className="text-slate-100">{course.level}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur">
                <PlayCircle className="size-4" />
                <span className="text-slate-100">{totalLessons} bài học</span>
              </div>
            </div>

            <p className="mt-6 text-slate-300">
              Được giảng dạy bởi: <span className="font-semibold text-white">{course.instructor}</span>
            </p>
          </div>

          <div>
            <div className="sticky top-24 overflow-hidden rounded-[30px] border border-white/10 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
              <img src={safeImage(course.image)} alt={course.title} className="aspect-[16/10] w-full object-cover" />
              <div className="p-6">
                <div className="mb-5 flex items-center gap-3">
                  {course.originalPrice ? (
                    <span className="text-gray-400 line-through">{formatPrice(course.originalPrice)}</span>
                  ) : null}
                  <span className="text-3xl font-semibold text-slate-900">{formatPrice(course.price)}</span>
                  {course.originalPrice ? (
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-700">
                      Giảm {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}%
                    </span>
                  ) : null}
                </div>

                <button
                  onClick={onAddToCart}
                  disabled={inCart}
                  className={`mb-3 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 font-semibold transition-all ${
                    inCart
                      ? "cursor-default bg-emerald-50 text-emerald-700"
                      : "bg-slate-900 text-white hover:bg-slate-700"
                  }`}
                >
                  {inCart ? (
                    <>
                      <Check className="size-5" />
                      Đã thêm vào giỏ hàng
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="size-5" />
                      Thêm vào giỏ hàng
                    </>
                  )}
                </button>

                {inCart ? (
                  <Link
                    to="/cart"
                    className="block w-full rounded-2xl bg-slate-900 py-3.5 text-center font-semibold text-white transition-colors hover:bg-slate-700"
                  >
                    Xem giỏ hàng
                  </Link>
                ) : null}

                <Link
                  to={`/learn/${course.slug ?? course.id}`}
                  className="mt-3 block w-full rounded-2xl border border-slate-200 bg-white py-3 text-center text-sm font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  🎓 Vào học ngay
                </Link>

                <div className="mt-6 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Award className="size-5 text-blue-600" />
                    <span>Chứng chỉ hoàn thành</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="size-5 text-blue-600" />
                    <span>Truy cập trọn đời</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="size-5 text-blue-600" />
                    <span>Tài liệu học tập</span>
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
