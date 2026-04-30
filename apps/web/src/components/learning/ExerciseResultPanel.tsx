"use client";

import { Award, CheckCircle, RefreshCw, XCircle } from "lucide-react";
import type { LessonExerciseResultDto } from "@/services/api";

type Props = {
  result: LessonExerciseResultDto;
  onRetry: () => void;
};

export default function ExerciseResultPanel({ result, onRetry }: Props) {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl">
        <div className={`mb-6 rounded-2xl p-6 text-center text-white ${result.passed ? "bg-gradient-to-br from-green-500 to-emerald-600" : "bg-gradient-to-br from-orange-500 to-red-500"}`}>
          <div className="mb-3 text-5xl">{result.passed ? "🏆" : "💪"}</div>
          <p className="mb-1 text-xl font-bold">{result.passed ? "Bạn đã qua bài quiz" : "Bạn chưa đạt bài quiz"}</p>
          <p className="text-sm text-white/80">
            Điểm của bạn: <strong>{Math.round(result.scorePercent)}%</strong> · Cần đạt: {result.passingPercent}%
          </p>
          {result.passed ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-sm">
              <Award className="size-4" /> Progress đã được cập nhật vào backend
            </div>
          ) : null}
        </div>

        <div className="mb-6 space-y-4">
          {result.questionResults.map((item, index) => (
            <div key={`${item.questionId}-${index}`} className={`rounded-xl border-2 p-4 ${item.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
              <div className="mb-2 flex items-start gap-2">
                {item.isCorrect ? <CheckCircle className="mt-0.5 size-5 text-green-600" /> : <XCircle className="mt-0.5 size-5 text-red-500" />}
                <div>
                  <p className="font-medium text-gray-900">{item.question}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Bạn chọn: {item.selectedOption} · Đáp án đúng: {item.correctOption}
                  </p>
                  {item.explanation ? <p className="mt-2 text-sm text-gray-600">{item.explanation}</p> : null}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onRetry} className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50">
            <RefreshCw className="size-4" /> Làm lại
          </button>
        </div>
      </div>
    </div>
  );
}
