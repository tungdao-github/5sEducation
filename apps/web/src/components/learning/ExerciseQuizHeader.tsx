"use client";

import { Clock } from "lucide-react";
import { useI18n } from "@/app/providers";

type Props = {
  currentIndex: number;
  totalQuestions: number;
  timeLeft: number;
  hasTimeLimit: boolean;
};

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remain = seconds % 60;
  return `${minutes}:${String(remain).padStart(2, "0")}`;
}

export default function ExerciseQuizHeader({ currentIndex, totalQuestions, timeLeft, hasTimeLimit }: Props) {
  const { tx } = useI18n();

  return (
    <div className="mb-6 flex items-center justify-between">
      <span className="text-sm font-medium text-gray-500">
        {tx("Question", "Câu")} {currentIndex + 1} / {totalQuestions}
      </span>
      {hasTimeLimit ? (
        <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-mono ${timeLeft < 60 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>
          <Clock className="size-3.5" /> {formatTimer(timeLeft)}
        </div>
      ) : null}
    </div>
  );
}
