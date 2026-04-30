"use client";

import { Trash2 } from "lucide-react";
import { Link } from "@/lib/router";
import { formatPrice } from "@/services/api";
import type { Course } from "@/contexts/CartContext";

type Props = {
  course: Course;
  onRemove: (id: string) => void;
  safeImage: (src?: string | null) => string;
};

export default function CartCourseItem({ course, onRemove, safeImage }: Props) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
      <div className="flex flex-col gap-4 p-4 sm:flex-row">
        <Link to={`/course/${course.slug ?? course.id}`} className="shrink-0">
          <img src={safeImage(course.image)} alt={course.title} className="h-32 w-full rounded-2xl object-cover sm:w-48" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link to={`/course/${course.slug ?? course.id}`}>
            <h3 className="mb-2 text-lg font-semibold text-slate-950 transition-colors hover:text-blue-600">{course.title}</h3>
          </Link>
          <p className="mb-2 text-sm text-slate-500">Giảng viên: {course.instructor}</p>
          <div className="mb-3 flex items-center gap-3 text-sm text-slate-500">
            <span>{course.duration}</span>
            <span>•</span>
            <span>{course.level}</span>
          </div>
          <div className="flex items-center gap-3">
            {course.originalPrice ? <span className="text-sm text-slate-400 line-through">{formatPrice(course.originalPrice)}</span> : null}
            <span className="text-2xl font-black text-blue-600">{formatPrice(course.price)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-start">
          <button onClick={() => onRemove(course.id)} className="rounded-2xl border border-rose-200 p-2 text-rose-600 transition-colors hover:bg-rose-50">
            <Trash2 className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
