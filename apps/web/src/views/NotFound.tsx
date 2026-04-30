"use client";

import { SEO } from "@/components/SEO";
import { useNavigate } from "@/lib/router";
import NotFoundActions from "@/components/not-found/NotFoundActions";
import NotFoundSuggestions from "@/components/not-found/NotFoundSuggestions";

export default function NotFound() {
  const navigate = useNavigate();

  const popularCourses = [
    { id: "gestalt-principles", title: "Gestalt Principles", icon: "🎨" },
    { id: "input-controls", title: "Input Controls", icon: "🎮" },
    { id: "microcopy", title: "Microcopy Writing", icon: "✍️" },
  ];

  return (
    <>
      <SEO title="404 - Trang không tìm thấy" description="Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa." noIndex />

      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-16">
        <div className="w-full max-w-3xl text-center">
          <div className="mb-8">
            <h1 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-9xl font-black leading-none text-transparent md:text-[12rem]">
              404
            </h1>
          </div>

          <div className="mb-12 space-y-4">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Oops! Trang không tìm thấy</h2>
            <p className="mx-auto max-w-xl text-lg text-gray-600">
              Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên, hoặc tạm thời không khả dụng.
            </p>
          </div>

          <NotFoundActions onBack={() => window.history.back()} onHome={() => navigate("/")} onSearch={() => navigate("/search")} />

          <NotFoundSuggestions items={popularCourses} />

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
