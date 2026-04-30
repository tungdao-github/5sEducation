"use client";

import type { ExerciseQuestionDraft, LessonItem, TxFn } from "@/components/studio/studioLessonsTypes";
import StudioLessonFields from "@/components/studio/StudioLessonFields";
import StudioLessonList from "@/components/studio/StudioLessonList";
import StudioExerciseQuestionsEditor from "@/components/studio/StudioExerciseQuestionsEditor";

type Props = {
  tx: TxFn;
  lessons: LessonItem[];
  lessonTitle: string;
  setLessonTitle: (value: string) => void;
  lessonContentType: string;
  setLessonContentType: (value: string) => void;
  lessonDuration: string;
  setLessonDuration: (value: string) => void;
  lessonVideoUrl: string;
  setLessonVideoUrl: (value: string) => void;
  lessonSortOrder: string;
  setLessonSortOrder: (value: string) => void;
  lessonExerciseQuestions: ExerciseQuestionDraft[];
  lessonExercisePassingPercent: string;
  setLessonExercisePassingPercent: (value: string) => void;
  lessonExerciseTimeLimitMinutes: string;
  setLessonExerciseTimeLimitMinutes: (value: string) => void;
  lessonExerciseMaxTabSwitches: string;
  setLessonExerciseMaxTabSwitches: (value: string) => void;
  isUploadingVideo: boolean;
  onAddLesson: () => void;
  onDeleteLesson: (lessonId: number) => void;
  onUploadVideo: (file: File) => void;
  onUpdateExerciseQuestion: (id: string, key: keyof Omit<ExerciseQuestionDraft, "id">, value: string) => void;
  onAddExerciseQuestion: () => void;
  onRemoveExerciseQuestion: (id: string) => void;
};

export function StudioLessonsSection({
  tx,
  lessons,
  lessonTitle,
  setLessonTitle,
  lessonContentType,
  setLessonContentType,
  lessonDuration,
  setLessonDuration,
  lessonVideoUrl,
  setLessonVideoUrl,
  lessonSortOrder,
  setLessonSortOrder,
  lessonExerciseQuestions,
  lessonExercisePassingPercent,
  setLessonExercisePassingPercent,
  lessonExerciseTimeLimitMinutes,
  setLessonExerciseTimeLimitMinutes,
  lessonExerciseMaxTabSwitches,
  setLessonExerciseMaxTabSwitches,
  isUploadingVideo,
  onAddLesson,
  onDeleteLesson,
  onUploadVideo,
  onUpdateExerciseQuestion,
  onAddExerciseQuestion,
  onRemoveExerciseQuestion,
}: Props) {
  return (
    <section className="surface-card space-y-6 rounded-3xl p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title text-2xl font-semibold text-emerald-950">{tx("Lessons", "Bai hoc")}</h2>
          <p className="text-sm text-emerald-800/70">{tx("Add, reorder, or remove lessons.", "Them, sap xep, hoac xoa bai hoc.")}</p>
        </div>
      </div>

      <StudioLessonList tx={tx} lessons={lessons} onDeleteLesson={onDeleteLesson} />
      <StudioLessonFields
        tx={tx}
        lessonTitle={lessonTitle}
        setLessonTitle={setLessonTitle}
        lessonContentType={lessonContentType}
        setLessonContentType={setLessonContentType}
        lessonDuration={lessonDuration}
        setLessonDuration={setLessonDuration}
        lessonVideoUrl={lessonVideoUrl}
        setLessonVideoUrl={setLessonVideoUrl}
        lessonSortOrder={lessonSortOrder}
        setLessonSortOrder={setLessonSortOrder}
        isUploadingVideo={isUploadingVideo}
        onUploadVideo={onUploadVideo}
      />

      {lessonContentType === "exercise" ? (
        <StudioExerciseQuestionsEditor
          tx={tx}
          lessonExerciseQuestions={lessonExerciseQuestions}
          lessonExercisePassingPercent={lessonExercisePassingPercent}
          setLessonExercisePassingPercent={setLessonExercisePassingPercent}
          lessonExerciseTimeLimitMinutes={lessonExerciseTimeLimitMinutes}
          setLessonExerciseTimeLimitMinutes={setLessonExerciseTimeLimitMinutes}
          lessonExerciseMaxTabSwitches={lessonExerciseMaxTabSwitches}
          setLessonExerciseMaxTabSwitches={setLessonExerciseMaxTabSwitches}
          onUpdateExerciseQuestion={onUpdateExerciseQuestion}
          onAddExerciseQuestion={onAddExerciseQuestion}
          onRemoveExerciseQuestion={onRemoveExerciseQuestion}
        />
      ) : null}

      <button type="button" onClick={onAddLesson} className="rounded-full border border-[color:var(--stroke)] px-6 py-3 text-sm font-semibold text-emerald-900">
        {tx("Add lesson", "Them bai hoc")}
      </button>
    </section>
  );
}
