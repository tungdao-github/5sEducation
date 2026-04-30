"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/app/providers";

type Props = {
  currentIndex: number;
  totalQuestions: number;
  allAnswered: boolean;
  loading: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
};

export default function ExerciseQuizFooter({ currentIndex, totalQuestions, allAnswered, loading, onPrev, onNext, onSubmit }: Props) {
  const { tx } = useI18n();

  return (
    <div className="flex items-center justify-between">
      <button
        disabled={currentIndex === 0}
        onClick={onPrev}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="size-4" /> {tx("Previous question", "Câu trước")}
      </button>
      {currentIndex < totalQuestions - 1 ? (
        <button onClick={onNext} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700">
          {tx("Next question", "Câu tiếp")} <ChevronRight className="size-4" />
        </button>
      ) : (
        <button
          disabled={!allAnswered || loading}
          onClick={onSubmit}
          className="rounded-xl bg-green-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? tx("Submitting...", "Đang nộp...") : tx("Submit", "Nộp bài")}
        </button>
      )}
    </div>
  );
}
