"use client";

import { PenSquare, PlayCircle } from "lucide-react";
import { useI18n } from "@/app/providers";
import type { LearningLesson } from "@/services/api";

type Props = {
  lesson: LearningLesson;
};

export default function OverviewHeader({ lesson }: Props) {
  const { tx } = useI18n();

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-gray-900">{lesson.title}</h2>
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
        <span className="inline-flex items-center gap-1">
          {lesson.type === "quiz" ? <PenSquare className="size-4" /> : <PlayCircle className="size-4" />}
          {lesson.type === "quiz" ? tx("Quiz", "Bài kiểm tra") : tx("Video", "Video")}
        </span>
        <span>·</span>
        <span>{lesson.duration}</span>
        {lesson.isPreview ? (
          <>
            <span>·</span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">{tx("Free preview", "Xem thử miễn phí")}</span>
          </>
        ) : null}
      </div>

      <div className="rounded-xl bg-gray-50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">{tx("About this lesson", "Về bài học này")}</span>
        </div>
        <p className="text-sm leading-relaxed text-gray-600">{lesson.description || tx("Lesson content will be delivered from the backend.", "Nội dung bài học sẽ được truyền trực tiếp từ backend.")}</p>
      </div>
    </div>
  );
}
