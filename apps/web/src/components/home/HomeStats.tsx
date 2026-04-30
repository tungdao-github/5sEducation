"use client";

import { Award, BookOpen, Star, Users } from "lucide-react";
import { useI18n } from "@/app/providers";

export default function HomeStats() {
  const { tx } = useI18n();
  const stats = [
    { icon: <BookOpen className="size-6 text-blue-600" />, value: "500+", label: tx("Courses", "Khóa học") },
    { icon: <Users className="size-6 text-green-600" />, value: "50K+", label: tx("Students", "Học viên") },
    { icon: <Star className="size-6 fill-yellow-500 text-yellow-500" />, value: "4.8★", label: tx("Average rating", "Đánh giá TB") },
    { icon: <Award className="size-6 text-purple-600" />, value: "100+", label: tx("Instructors", "Giảng viên") },
  ];

  return (
    <section className="border-b border-gray-100 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-gray-50">
                {stat.icon}
              </div>
              <div className="mb-1 text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
