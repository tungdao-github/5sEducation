"use client";

import { ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "@/lib/router";
import { formatPrice } from "@/services/api";
import { useI18n } from "@/app/providers";
import type { Course } from "@/contexts/CartContext";

type Props = {
  course: Course;
  inCart: boolean;
  onAddToCart: (course: Course) => void;
  onRemove: (courseId: string) => void;
  safeImage: (src?: string | null) => string;
};

export default function WishlistCourseCard({ course, inCart, onAddToCart, onRemove, safeImage }: Props) {
  const { tx } = useI18n();

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
      <div className="flex gap-4 p-4">
        <Link to={`/course/${course.slug ?? course.id}`} className="shrink-0">
          <img src={safeImage(course.image)} alt={course.title} className="h-24 w-32 rounded-2xl object-cover" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link to={`/course/${course.slug ?? course.id}`}>
            <h3 className="line-clamp-2 text-sm font-semibold text-slate-950 transition-colors hover:text-blue-600">{course.title}</h3>
          </Link>
          <p className="mt-1 text-xs text-slate-500">{course.instructor}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-semibold text-slate-950">{formatPrice(course.price)}</span>
            {course.originalPrice ? <span className="text-xs text-slate-400 line-through">{formatPrice(course.originalPrice)}</span> : null}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => onAddToCart(course)}
              disabled={inCart}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-2 text-xs font-medium transition-colors ${
                inCart ? "bg-emerald-50 text-emerald-700" : "bg-slate-900 text-white hover:bg-slate-700"
              }`}
            >
              <ShoppingCart className="size-3.5" />
              {inCart ? tx("Already in cart", "Đã trong giỏ") : tx("Add to cart", "Thêm vào giỏ")}
            </button>
            <button onClick={() => onRemove(course.id)} className="rounded-2xl border border-slate-200 p-2 text-slate-400 transition-colors hover:text-rose-500">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
