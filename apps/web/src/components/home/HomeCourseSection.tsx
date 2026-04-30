"use client";

import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "@/lib/router";
import CourseCard from "@/components/CourseCard";
import type { Course } from "@/contexts/CartContext";
import { useI18n } from "@/app/providers";

type Props = {
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  filteredCourses: Course[];
};

export default function HomeCourseSection({ selectedCategory, setSelectedCategory, filteredCourses }: Props) {
  const { tx } = useI18n();
  const categories = [
    { value: "all", label: tx("All", "Tất cả") },
    { value: "ux-ui", label: tx("UX/UI Design", "Thiết kế UX/UI") },
    { value: "ux-research", label: tx("UX Research", "Nghiên cứu UX") },
    { value: "ux-writing", label: tx("UX Writing", "Viết nội dung UX") },
    { value: "ux-management", label: tx("UX Management", "Quản lý UX") },
    { value: "ux-analysis", label: tx("UX Analysis", "Phân tích UX") },
  ];

  return (
    <section className="py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="mb-2 text-3xl font-bold text-gray-900">{tx("Popular courses", "Khóa học phổ biến")}</h2>
            <p className="text-gray-500">{tx("Loved and highly rated by students", "Được học viên yêu thích và đánh giá cao nhất")}</p>
          </div>
          <Link to="/search" className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
            {tx("View all", "Xem tất cả")} <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mb-6 overflow-x-auto">
          <div className="flex w-max gap-2 pb-2">
            {categories.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => setSelectedCategory(category.value)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === category.value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mb-6 text-sm text-gray-500">
          {tx("Found", "Tìm thấy")} <span className="font-semibold text-gray-900">{filteredCourses.length}</span> {tx("courses", "khóa học")}
        </p>

        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <BookOpen className="mx-auto mb-3 size-12 text-gray-200" />
            <p className="text-gray-500">{tx("No matching courses found", "Không tìm thấy khóa học nào phù hợp")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
