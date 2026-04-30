"use client";

import { PenSquare } from "lucide-react";
import { useI18n } from "@/app/providers";
import type { LearningLesson } from "@/services/api";

type Props = {
  lesson: LearningLesson;
};

export default function OverviewQuizInfo({ lesson }: Props) {
  const { tx } = useI18n();
  if (lesson.type !== "quiz" || !lesson.exercise) return null;

  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-orange-900">
        <PenSquare className="size-4" /> {tx("Quiz details", "Về bài quiz này")}
      </h3>
      <ul className="space-y-1.5 text-sm text-orange-800">
        <li>
          {tx("Questions", "Số câu hỏi")}: <strong>{lesson.exercise.questions.length}</strong>
        </li>
        <li>
          {tx("Passing score", "Điểm đạt")}: <strong>{lesson.exercise.passingScore}%</strong>
        </li>
        {lesson.exercise.timeLimit > 0 ? (
          <li>
            {tx("Time limit", "Thời gian")}: <strong>{lesson.exercise.timeLimit} {tx("minutes", "phút")}</strong>
          </li>
        ) : null}
        <li>{tx("You can retry the quiz many times to improve your result.", "Có thể làm lại nhiều lần để cải thiện kết quả.")}</li>
      </ul>
      <p className="mt-3 text-xs text-orange-600">{tx("Switch to the Exercise tab to take the quiz and submit answers to the backend.", "Chuyển sang tab Bài tập để làm quiz và nộp đáp án thật vào backend.")}</p>
    </div>
  );
}
