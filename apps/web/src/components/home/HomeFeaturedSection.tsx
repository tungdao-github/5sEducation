"use client";

import { Link } from "@/lib/router";
import CourseCard from "@/components/CourseCard";
import type { Course } from "@/contexts/CartContext";
import { useI18n } from "@/app/providers";

type Props = {
  topRatedCourses: Course[];
};

export default function HomeFeaturedSection({ topRatedCourses }: Props) {
  const { tx } = useI18n();

  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-bold text-gray-900">{tx("Top rated courses", "Khóa học được đánh giá cao nhất")}</h2>
            <p className="text-gray-500">{tx("The courses students love most", "Các khóa học được học viên yêu thích nhất")}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {topRatedCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}
