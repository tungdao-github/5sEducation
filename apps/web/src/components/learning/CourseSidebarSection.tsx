"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useI18n } from "@/app/providers";
import type { LearningLesson, LearningSection } from "@/services/api";
import CourseSidebarLessonItem from "@/components/learning/CourseSidebarLessonItem";

type Props = {
  section: LearningSection;
  index: number;
  isOpen: boolean;
  completedIds: number[];
  currentLessonId: string;
  onToggle: (id: string) => void;
  onSelectLesson: (lesson: LearningLesson) => void;
};

export default function CourseSidebarSection({ section, index, isOpen, completedIds, currentLessonId, onToggle, onSelectLesson }: Props) {
  const { tx } = useI18n();
  const sectionCompleted = section.lessons.filter((lesson) => completedIds.includes(lesson.numericId)).length;

  return (
    <div className="border-b border-gray-800">
      <button className="flex w-full items-start gap-2 p-4 text-left transition hover:bg-gray-800" onClick={() => onToggle(section.id)}>
        <div className="mt-0.5">{isOpen ? <ChevronDown className="size-4 text-gray-400" /> : <ChevronRight className="size-4 text-gray-400" />}</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-100">
            {tx("Section", "Phần")} {index + 1}: {section.title}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {sectionCompleted}/{section.lessons.length} {tx("lessons", "bài học")} · {section.duration}
          </p>
        </div>
      </button>

      {isOpen ? (
        <div>
          {section.lessons.map((lesson) => (
            <CourseSidebarLessonItem
              key={lesson.id}
              lesson={lesson}
              active={lesson.id === currentLessonId}
              completed={completedIds.includes(lesson.numericId)}
              onSelectLesson={onSelectLesson}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
