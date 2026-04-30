"use client";

import { CheckCircle, PenSquare, PlayCircle } from "lucide-react";
import { useI18n } from "@/app/providers";
import type { LearningLesson } from "@/services/api";

type Props = {
  lesson: LearningLesson;
  active: boolean;
  completed: boolean;
  onSelectLesson: (lesson: LearningLesson) => void;
};

export default function CourseSidebarLessonItem({ lesson, active, completed, onSelectLesson }: Props) {
  const { tx } = useI18n();

  return (
    <button
      onClick={() => onSelectLesson(lesson)}
      className={`flex w-full items-start gap-3 border-l-2 px-4 py-3 text-left transition ${active ? "border-blue-500 bg-blue-600/20" : "border-transparent hover:bg-gray-800"}`}
    >
      <div className="mt-0.5 shrink-0">
        {completed ? <CheckCircle className="size-4 text-green-500" /> : lesson.type === "quiz" ? <PenSquare className="size-4 text-orange-400" /> : <PlayCircle className="size-4 text-blue-400" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`line-clamp-2 text-xs ${active ? "font-medium text-blue-300" : "text-gray-300"}`}>{lesson.title}</p>
        <p className="mt-0.5 text-xs text-gray-500">
          {lesson.type === "quiz" ? tx("Quiz", "Bài kiểm tra") : tx("Video", "Video")} · {lesson.duration}
        </p>
      </div>
    </button>
  );
}
