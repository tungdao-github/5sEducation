"use client";

import { AlertCircle, CheckCircle } from "lucide-react";
import { useI18n } from "@/app/providers";
import type { LessonExerciseStatusDto } from "@/services/api";

type Props = {
  title: string;
  description?: string;
  questionCount: number;
  timeLimit: number;
  passingScore: number;
  status: LessonExerciseStatusDto | null;
  onStart: () => void;
};

export default function ExerciseIntroPanel({ title, description, questionCount, timeLimit, passingScore, status, onStart }: Props) {
  const { tx } = useI18n();

  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-orange-100 text-2xl">🧪</div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-blue-50 p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{questionCount}</p>
            <p className="text-sm text-blue-700">{tx("Questions", "Câu hỏi")}</p>
          </div>
          <div className="rounded-xl bg-orange-50 p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{timeLimit > 0 ? `${timeLimit} ${tx("minutes", "phút")}` : "∞"}</p>
            <p className="text-sm text-orange-700">{tx("Time limit", "Thời gian")}</p>
          </div>
          <div className="rounded-xl bg-green-50 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{passingScore}%</p>
            <p className="text-sm text-green-700">{tx("Passing score", "Điểm đạt")}</p>
          </div>
        </div>

        {status && status.attemptCount > 0 ? (
          <div className={`mb-4 flex items-center gap-3 rounded-xl border p-4 ${status.passed ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}`}>
            {status.passed ? <CheckCircle className="size-5 text-green-600" /> : <AlertCircle className="size-5 text-orange-600" />}
            <p className="text-sm text-gray-700">
              {tx("Last attempt", "Lần gần nhất")}: <strong>{Math.round(status.lastScorePercent ?? 0)}%</strong> · {status.passed ? tx("Passed", "Đã đạt") : tx("Not passed", "Chưa đạt")} · {status.attemptCount} {tx("attempts", "lần thử")}
            </p>
          </div>
        ) : null}

        <div className="flex gap-3">
          <button onClick={onStart} className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700">
            {status?.attemptCount ? tx("Retake quiz", "Làm lại bài quiz") : tx("Start quiz", "Bắt đầu làm bài")}
          </button>
        </div>
      </div>
    </div>
  );
}
