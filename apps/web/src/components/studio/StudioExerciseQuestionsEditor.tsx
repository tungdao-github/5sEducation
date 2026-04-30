"use client";

import type { ExerciseQuestionDraft, TxFn } from "@/components/studio/studioLessonsTypes";

type Props = {
  tx: TxFn;
  lessonExerciseQuestions: ExerciseQuestionDraft[];
  lessonExercisePassingPercent: string;
  setLessonExercisePassingPercent: (value: string) => void;
  lessonExerciseTimeLimitMinutes: string;
  setLessonExerciseTimeLimitMinutes: (value: string) => void;
  lessonExerciseMaxTabSwitches: string;
  setLessonExerciseMaxTabSwitches: (value: string) => void;
  onUpdateExerciseQuestion: (id: string, key: keyof Omit<ExerciseQuestionDraft, "id">, value: string) => void;
  onAddExerciseQuestion: () => void;
  onRemoveExerciseQuestion: (id: string) => void;
};

export default function StudioExerciseQuestionsEditor({
  tx,
  lessonExerciseQuestions,
  lessonExercisePassingPercent,
  setLessonExercisePassingPercent,
  lessonExerciseTimeLimitMinutes,
  setLessonExerciseTimeLimitMinutes,
  lessonExerciseMaxTabSwitches,
  setLessonExerciseMaxTabSwitches,
  onUpdateExerciseQuestion,
  onAddExerciseQuestion,
  onRemoveExerciseQuestion,
}: Props) {
  return (
    <div className="md:col-span-2 space-y-3">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{tx("Passing score (%)", "Diem dat (%)")}</label>
          <input
            type="number"
            min="1"
            max="100"
            value={lessonExercisePassingPercent}
            onChange={(e) => setLessonExercisePassingPercent(e.currentTarget.value)}
            className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{tx("Time limit (minutes, 0 = no limit)", "Gioi han thoi gian (0 = khong gioi han)")}</label>
          <input
            type="number"
            min="0"
            max="180"
            value={lessonExerciseTimeLimitMinutes}
            onChange={(e) => setLessonExerciseTimeLimitMinutes(e.currentTarget.value)}
            className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{tx("Max tab switches", "So lan doi tab toi da")}</label>
          <input
            type="number"
            min="0"
            max="20"
            value={lessonExerciseMaxTabSwitches}
            onChange={(e) => setLessonExerciseMaxTabSwitches(e.currentTarget.value)}
            className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
          />
        </div>
      </div>

      {lessonExerciseQuestions.map((question, index) => (
        <div key={question.id} className="rounded-2xl border border-[color:var(--stroke)] bg-white/70 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{tx(`Question ${index + 1}`, `Cau hoi ${index + 1}`)}</p>
            <button type="button" onClick={() => onRemoveExerciseQuestion(question.id)} className="rounded-full border border-[color:var(--stroke)] px-3 py-1 text-[11px] font-semibold text-emerald-900">
              {tx("Remove", "Xoa")}
            </button>
          </div>
          <textarea
            value={question.question}
            onChange={(e) => onUpdateExerciseQuestion(question.id, "question", e.currentTarget.value)}
            rows={2}
            placeholder={tx("Add a quiz question for this lesson...", "Nhap cau hoi cho bai hoc...")}
            className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <input value={question.optionA} onChange={(e) => onUpdateExerciseQuestion(question.id, "optionA", e.currentTarget.value)} placeholder={tx("Option A", "Lua chon A")} className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm" />
            <input value={question.optionB} onChange={(e) => onUpdateExerciseQuestion(question.id, "optionB", e.currentTarget.value)} placeholder={tx("Option B", "Lua chon B")} className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm" />
            <input value={question.optionC} onChange={(e) => onUpdateExerciseQuestion(question.id, "optionC", e.currentTarget.value)} placeholder={tx("Option C", "Lua chon C")} className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm" />
            <input value={question.optionD} onChange={(e) => onUpdateExerciseQuestion(question.id, "optionD", e.currentTarget.value)} placeholder={tx("Option D", "Lua chon D")} className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <select value={question.correctOption} onChange={(e) => onUpdateExerciseQuestion(question.id, "correctOption", e.currentTarget.value)} className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm">
              <option value="1">{tx("Correct option: A", "Dap an dung: A")}</option>
              <option value="2">{tx("Correct option: B", "Dap an dung: B")}</option>
              <option value="3">{tx("Correct option: C", "Dap an dung: C")}</option>
              <option value="4">{tx("Correct option: D", "Dap an dung: D")}</option>
            </select>
            <input
              value={question.explanation}
              onChange={(e) => onUpdateExerciseQuestion(question.id, "explanation", e.currentTarget.value)}
              placeholder={tx("Explanation (optional)", "Giai thich (tuy chon)")}
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
            />
          </div>
        </div>
      ))}

      <button type="button" onClick={onAddExerciseQuestion} className="rounded-full border border-[color:var(--stroke)] px-4 py-2 text-xs font-semibold text-emerald-900">
        {tx("Add another question", "Them cau hoi")}
      </button>
    </div>
  );
}
