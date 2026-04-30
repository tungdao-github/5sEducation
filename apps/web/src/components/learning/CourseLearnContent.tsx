"use client";

import { PenSquare } from "lucide-react";
import { useI18n } from "@/app/providers";
import type { LearningLesson } from "@/services/api";
import OverviewPanel from "@/components/learning/OverviewPanel";
import NotesPanel from "@/components/learning/NotesPanel";
import CourseLearnQATab from "@/components/learning/CourseLearnQATab";
import ExercisePanel from "@/components/learning/ExercisePanel";

export type CourseLearnTabId = "overview" | "notes" | "qa" | "exercise";

type Props = {
  lesson: LearningLesson;
  courseId: string;
  currentTime: number;
  activeTab: CourseLearnTabId;
  onSeek: (time: number) => void;
  onPassed: () => void;
};

export default function CourseLearnContent({ lesson, courseId, currentTime, activeTab, onSeek, onPassed }: Props) {
  const { tx } = useI18n();

  return (
    <div className="bg-white pb-20">
      {activeTab === "overview" ? (
        <OverviewPanel lesson={lesson} />
      ) : activeTab === "notes" ? (
        <NotesPanel courseId={courseId} lessonId={lesson.id} currentTime={currentTime} onSeek={onSeek} />
      ) : activeTab === "qa" ? (
        <CourseLearnQATab lesson={lesson} />
      ) : activeTab === "exercise" ? (
        lesson.exercise ? (
          <ExercisePanel lesson={lesson} courseId={courseId} lessonId={lesson.id} onPassed={onPassed} />
        ) : (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <div className="text-center">
              <PenSquare className="mx-auto mb-3 size-12 opacity-50" />
              <p className="font-medium">{tx("This lesson does not have an exercise.", "Bài học này không có bài tập")}</p>
              <p className="mt-1 text-sm">{tx("Choose a quiz in the lesson list.", "Chọn bài kiểm tra trong danh sách bài học")}</p>
            </div>
          </div>
        )
      ) : null}
    </div>
  );
}
