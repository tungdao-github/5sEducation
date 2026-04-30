"use client";

import type { LessonItem, TxFn } from "@/components/studio/studioLessonsTypes";

type Props = {
  tx: TxFn;
  lessons: LessonItem[];
  onDeleteLesson: (lessonId: number) => void;
};

export default function StudioLessonList({ tx, lessons, onDeleteLesson }: Props) {
  return (
    <div className="space-y-3">
      {lessons.length === 0 ? (
        <p className="text-sm text-emerald-800/70">{tx("No lessons yet. Add your first lesson below.", "Chua co bai hoc. Hay them bai hoc dau tien.")}</p>
      ) : null}
      {lessons.map((lesson) => (
        <div key={lesson.id} className="flex items-center justify-between rounded-2xl bg-white/70 p-3">
          <div>
            <p className="text-sm font-semibold text-emerald-950">{lesson.title}</p>
            <p className="text-xs text-emerald-800/70">
              {lesson.durationMinutes} mins - Sort {lesson.sortOrder}
            </p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
              {(lesson.contentType ?? "video").toLowerCase()}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onDeleteLesson(lesson.id)}
            className="rounded-full border border-[color:var(--stroke)] px-3 py-1 text-xs font-semibold text-emerald-900"
          >
            {tx("Delete", "Xoa")}
          </button>
        </div>
      ))}
    </div>
  );
}
