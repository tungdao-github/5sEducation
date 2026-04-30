"use client";

import type { LearningLesson } from "@/services/api";
import ExerciseIntroPanel from "@/components/learning/ExerciseIntroPanel";
import ExerciseQuizPanel from "@/components/learning/ExerciseQuizPanel";
import ExerciseResultPanel from "@/components/learning/ExerciseResultPanel";
import { useExercisePanel } from "@/components/learning/useExercisePanel";

interface Props {
  lesson: LearningLesson;
  courseId: string;
  lessonId: string;
  onPassed?: () => void;
}

export default function ExercisePanel({ lesson, lessonId, onPassed }: Props) {
  const {
    exercise,
    phase,
    currentIndex,
    setCurrentIndex,
    answers,
    setAnswers,
    timeLeft,
    status,
    result,
    loading,
    question,
    startQuiz,
    submit,
    setPhase,
  } = useExercisePanel({ lesson, lessonId, onPassed });

  if (!exercise) {
    return <div className="flex h-full items-center justify-center p-8 text-gray-400">Bai hoc nay chua co bai tap.</div>;
  }

  if (phase === "intro") {
    return (
      <ExerciseIntroPanel
        title={exercise.title}
        description={exercise.description}
        questionCount={exercise.questions.length}
        timeLimit={exercise.timeLimit}
        passingScore={exercise.passingScore}
        status={status}
        onStart={startQuiz}
      />
    );
  }

  if (phase === "quiz" && question) {
    return (
      <ExerciseQuizPanel
        lesson={lesson}
        currentIndex={currentIndex}
        answers={answers}
        timeLeft={timeLeft}
        loading={loading}
        onSelectAnswer={(questionId, optionValue) => setAnswers((prev) => ({ ...prev, [questionId]: optionValue }))}
        onPrev={() => setCurrentIndex((value) => Math.max(0, value - 1))}
        onNext={() => setCurrentIndex((value) => value + 1)}
        onSubmit={() => void submit(false)}
      />
    );
  }

  if (!result) return null;

  return <ExerciseResultPanel result={result} onRetry={() => setPhase("intro")} />;
}
