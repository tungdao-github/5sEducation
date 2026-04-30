export interface ExerciseQuestionDraft {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  explanation: string;
}

export interface LessonItem {
  id: number;
  title: string;
  contentType?: string;
  durationMinutes: number;
  sortOrder: number;
}

export type TxFn = (en: string, vi: string) => string;
