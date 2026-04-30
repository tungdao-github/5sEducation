"use client";

import { BookOpen } from "lucide-react";
import { useI18n } from "@/app/providers";

export default function CourseLearnAuthState() {
  const { tx } = useI18n();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
      <div className="text-center">
        <BookOpen className="mx-auto mb-4 size-16 opacity-50" />
        <p>{tx("You need to sign in to access this course.", "Bạn cần đăng nhập để học khóa học.")}</p>
      </div>
    </div>
  );
}
