"use client";

import { ArrowRight, BookOpen, TrendingUp } from "lucide-react";
import { Link } from "@/lib/router";
import { useI18n } from "@/app/providers";

export default function HomeLearningPaths() {
  const { tx } = useI18n();
  const learningPaths = [
    {
      title: tx("UX Designer from zero", "UX Designer từ Zero"),
      icon: "🎨",
      duration: tx("6 months", "6 tháng"),
      courses: 4,
      level: tx("Beginner → Intermediate", "Sơ cấp → Trung cấp"),
      desc: tx("A complete path from fundamentals to UX mastery", "Lộ trình toàn diện từ cơ bản đến thành thạo UX Design"),
      color: "border-blue-200 bg-blue-50",
      badge: tx("Most popular", "Phổ biến nhất"),
    },
    {
      title: tx("Professional UX Writer", "UX Writer Chuyên nghiệp"),
      icon: "✍️",
      duration: tx("3 months", "3 tháng"),
      courses: 2,
      level: tx("Intermediate", "Trung cấp"),
      desc: tx("Write effective microcopy and UX content for digital products", "Viết microcopy và nội dung UX hiệu quả cho sản phẩm số"),
      color: "border-purple-200 bg-purple-50",
      badge: tx("New", "Mới"),
    },
    {
      title: tx("UX Research Master", "UX Research Master"),
      icon: "🔬",
      duration: tx("4 months", "4 tháng"),
      courses: 3,
      level: tx("Intermediate → Advanced", "Trung cấp → Nâng cao"),
      desc: tx("Master user research and data analysis", "Thành thạo nghiên cứu người dùng và phân tích dữ liệu"),
      color: "border-green-200 bg-green-50",
      badge: "",
    },
  ];

  return (
    <section className="bg-gray-50 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="mb-2 text-3xl font-bold text-gray-900">{tx("Learning paths", "Lộ trình học tập")}</h2>
            <p className="text-gray-500">{tx("Follow a path to reach your goal faster", "Học theo lộ trình để đạt mục tiêu nhanh nhất")}</p>
          </div>
          <Link to="/search" className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
            {tx("View all", "Xem tất cả")} <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {learningPaths.map((path) => (
            <div key={path.title} className={`cursor-pointer rounded-2xl border-2 ${path.color} p-6 transition hover:shadow-md`}>
              {path.badge && <span className="mb-3 inline-block rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white">{path.badge}</span>}
              <div className="mb-4 text-4xl">{path.icon}</div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">{path.title}</h3>
              <p className="mb-4 text-sm text-gray-600">{path.desc}</p>
              <div className="mb-5 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <BookOpen className="size-4" />
                  {path.courses} {tx("courses", "khóa học")}
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="size-4" />
                  {path.level}
                </span>
              </div>
              <p className="mb-4 text-xs text-gray-400">
                {tx("Complete in", "Hoàn thành trong")} ~{path.duration}
              </p>
              <Link to="/search" className="block w-full rounded-xl border border-current bg-white py-2.5 text-center text-sm font-medium text-blue-600 transition hover:bg-blue-600 hover:text-white">
                {tx("Start path", "Bắt đầu lộ trình")} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
