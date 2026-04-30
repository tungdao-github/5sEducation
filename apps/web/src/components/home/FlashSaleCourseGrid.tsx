"use client";

import { Link } from "@/lib/router";
import type { Course } from "@/contexts/CartContext";
import { formatPriceCompact } from "@/services/api";
import { useI18n } from "@/app/providers";

type Props = {
  courses: Course[];
};

export default function FlashSaleCourseGrid({ courses }: Props) {
  const { tx } = useI18n();

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {courses.map((course) => (
        <Link key={course.id} to={`/courses/${course.slug ?? course.id}`} className="group">
          <div className="overflow-hidden rounded-xl bg-white shadow-lg transition-shadow hover:shadow-xl">
            <div className="relative overflow-hidden">
              <img src={course.image} alt={course.title} className="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white animate-pulse">
                -{Math.round((1 - (course.price * 0.7) / course.price) * 100)}%
              </div>
            </div>
            <div className="p-3">
              <p className="mb-2 line-clamp-2 text-xs font-semibold text-gray-900">{course.title}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-red-600">{formatPriceCompact(Math.round(course.price * 0.7))}</span>
                <span className="text-xs text-gray-400 line-through">{formatPriceCompact(course.price)}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500">
                <span className="text-yellow-500">★{course.rating}</span>
                <span>·</span>
                <span>{course.students.toLocaleString()} {tx("learners", "học viên")}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
