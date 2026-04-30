"use client";

import { useI18n } from "@/app/providers";

export default function CourseLearnLoadingState() {
  const { tx } = useI18n();
  return <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">{tx("Loading lesson...", "Đang tải bài học...")}</div>;
}
