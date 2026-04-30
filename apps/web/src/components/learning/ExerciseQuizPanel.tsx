"use client";

import type { LearningLesson } from "@/services/api";
import ExerciseQuizFooter from "@/components/learning/ExerciseQuizFooter";
import ExerciseQuizHeader from "@/components/learning/ExerciseQuizHeader";
import ExerciseQuizQuestion from "@/components/learning/ExerciseQuizQuestion";

type Props = {
  lesson: LearningLesson;
  currentIndex: number;
  answers: Record<number, number>;
  timeLeft: number;
  loading: boolean;
  onSelectAnswer: (questionId: number, optionValue: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
};

export default function ExerciseQuizPanel({
  lesson,
  currentIndex,
  answers,
  timeLeft,
  loading,
  onSelectAnswer,
  onPrev,
  onNext,
  onSubmit,
}: Props) {
  const exercise = lesson.exercise;
  const question = exercise?.questions[currentIndex];
  if (!exercise || !question) return null;

  const allAnswered = exercise.questions.every((item) => answers[item.numericId]);

  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl">
        <ExerciseQuizHeader
          currentIndex={currentIndex}
          totalQuestions={exercise.questions.length}
          timeLeft={timeLeft}
          hasTimeLimit={exercise.timeLimit > 0}
        />

        <div className="mb-6 h-1 rounded-full bg-gray-200">
          <div className="h-1 rounded-full bg-blue-500 transition-all" style={{ width: `${((currentIndex + 1) / exercise.questions.length) * 100}%` }} />
        </div>

        <ExerciseQuizQuestion question={question} selectedAnswer={answers[question.numericId]} onSelectAnswer={onSelectAnswer} />

        <ExerciseQuizFooter
          currentIndex={currentIndex}
          totalQuestions={exercise.questions.length}
          allAnswered={allAnswered}
          loading={loading}
          onPrev={onPrev}
          onNext={onNext}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}
