"use client";

import { Check, ShoppingCart, Star, X } from "lucide-react";
import { Link } from "@/lib/router";
import { formatPrice } from "@/services/api";
import type { Course } from "@/contexts/CartContext";

type Props = {
  course: Course;
  onRemove: (id: string) => void;
  onAddToCart: (course: Course) => void;
};

export default function CompareSelectedCard({ course, onRemove, onAddToCart }: Props) {
  return (
    <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
      <div className="relative h-40 bg-slate-100">
        <img src={course.image} alt={course.title} className="h-full w-full object-cover" />
        <button onClick={() => onRemove(course.id)} className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm transition hover:text-red-600">
          <X className="size-4" />
        </button>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <Link to={`/course/${course.slug ?? course.id}`} className="text-lg font-semibold tracking-[-0.02em] text-slate-950 transition hover:text-blue-600">
            {course.title}
          </Link>
          <p className="mt-1 text-sm text-slate-500">{course.instructor}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-blue-50 px-4 py-3">
            <p className="text-xs text-blue-700">Giá</p>
            <p className="text-lg font-semibold text-blue-700">{formatPrice(course.price)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">Đánh giá</p>
            <p className="text-lg font-semibold text-slate-950">{course.rating}★</p>
          </div>
        </div>
        <button onClick={() => onAddToCart(course)} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          <ShoppingCart className="size-4" />
          Thêm vào giỏ
        </button>
      </div>
    </article>
  );
}
