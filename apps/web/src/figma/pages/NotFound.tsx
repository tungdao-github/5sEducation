"use client";

import { useNavigate } from "@/figma/compat/router";
import { ArrowLeft, BookOpen, Home, Search } from "lucide-react";
import { SEO } from "../components/SEO";

export default function NotFound() {
  const navigate = useNavigate();

  const popularCourses = [
    { id: "gestalt-principles", title: "Gestalt Principles", icon: "🎨" },
    { id: "input-controls", title: "Input Controls", icon: "🎮" },
    { id: "microcopy", title: "Microcopy Writing", icon: "✍️" },
  ];

  return (
    <>
      <SEO
        title="404 - Trang không tìm thấy"
        description="Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
        noIndex
      />

      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-16">
        <div className="w-full max-w-3xl text-center">
          <div className="mb-8">
            <h1 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-9xl font-black leading-none text-transparent md:text-[12rem]">
              404
            </h1>
          </div>

          <div className="mb-12 space-y-4">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Oops! Trang không tìm thấy
            </h2>
            <p className="mx-auto max-w-xl text-lg text-gray-600">
              Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên, hoặc tạm thời không
              khả dụng.
            </p>
          </div>

          <div className="mb-16 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-300"
            >
              <ArrowLeft className="size-5" />
              Quay lại
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
            >
              <Home className="size-5" />
              Về trang chủ
            </button>
            <button
              onClick={() => navigate("/search")}
              className="flex items-center gap-2 rounded-lg border-2 border-indigo-600 px-6 py-3 font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
            >
              <Search className="size-5" />
              Tìm khóa học
            </button>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
            <div className="mb-6 flex items-center justify-center gap-2">
              <BookOpen className="size-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-gray-900">Có thể bạn quan tâm</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {popularCourses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => navigate(`/course/${course.id}`)}
                  className="group rounded-xl border-2 border-gray-200 p-4 transition-all hover:border-indigo-600 hover:bg-indigo-50"
                >
                  <div className="mb-2 text-4xl">{course.icon}</div>
                  <h4 className="font-semibold text-gray-900 transition-colors group-hover:text-indigo-600">
                    {course.title}
                  </h4>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            Nếu bạn cần trợ giúp, vui lòng liên hệ{" "}
            <a href="mailto:support@educourse.vn" className="text-indigo-600 hover:underline">
              support@educourse.vn
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
