"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/app/providers";
import type { LearningLesson, LearningSection } from "@/services/api";

type Props = {
  currentLesson: LearningLesson;
  prevLesson: LearningLesson | null;
  nextLesson: LearningLesson | null;
  sections: LearningSection[];
  onPrev: () => void;
  onNext: () => void;
};

export default function CourseLearnLessonBar({ currentLesson, prevLesson, nextLesson, sections, onPrev, onNext }: Props) {
  const { tx } = useI18n();

  return (
    <div className="flex items-center gap-3 border-b border-gray-800 bg-gray-900 px-4 py-3">
      <button
        onClick={onPrev}
        disabled={!prevLesson}
        className="rounded-lg px-3 py-1.5 text-sm text-gray-400 transition hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronLeft className="inline size-4" /> {tx("Previous lesson", "Bài trước")}
      </button>
      <div className="min-w-0 flex-1 text-center">
        <p className="truncate text-sm font-medium text-gray-200">{currentLesson.title}</p>
        <p className="mt-0.5 text-xs text-gray-500">{sections.find((section) => section.id === currentLesson.sectionId)?.title}</p>
      </div>
      <button
        onClick={onNext}
        disabled={!nextLesson}
        className="rounded-lg px-3 py-1.5 text-sm text-gray-400 transition hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        {tx("Next lesson", "Bài tiếp")} <ChevronRight className="inline size-4" />
      </button>
    </div>
  );
}
