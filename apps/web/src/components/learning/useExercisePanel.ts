"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchLessonExerciseStatus, submitLessonExercise, type LearningLesson, type LessonExerciseResultDto, type LessonExerciseStatusDto } from "@/services/api";
import { toast } from "@/lib/notify";

export type ExercisePhase = "intro" | "quiz" | "review";

type Params = {
  lesson: LearningLesson;
  lessonId: string;
  onPassed?: () => void;
};

export function useExercisePanel({ lesson, lessonId, onPassed }: Params) {
  const exercise = lesson.exercise;
  const [phase, setPhase] = useState<ExercisePhase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(exercise?.timeLimit ? exercise.timeLimit * 60 : 0);
  const [status, setStatus] = useState<LessonExerciseStatusDto | null>(null);
  const [result, setResult] = useState<LessonExerciseResultDto | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!exercise) return;
    let cancelled = false;

    async function loadStatus() {
      try {
        const response = await fetchLessonExerciseStatus(Number(lessonId));
        if (!cancelled) {
          setStatus(response);
          if (response.lastScorePercent !== null && response.lastScorePercent !== undefined) {
            setPhase("intro");
          }
        }
      } catch {
        if (!cancelled) {
          setStatus(null);
        }
      }
    }

    void loadStatus();
    return () => {
      cancelled = true;
    };
  }, [exercise, lessonId]);

  const question = useMemo(() => exercise?.questions[currentIndex], [exercise, currentIndex]);

  const startQuiz = () => {
    if (!exercise) return;
    setPhase("quiz");
    setAnswers({});
    setCurrentIndex(0);
    setTimeLeft(exercise.timeLimit * 60);
    setResult(null);
    setStartedAt(new Date().toISOString());
  };

  const submit = async (timedOut = false) => {
    if (!exercise) return;
    setLoading(true);
    try {
      const response = await submitLessonExercise(Number(lessonId), {
        answers: exercise.questions.map((item) => ({
          questionId: item.numericId,
          selectedOption: answers[item.numericId] ?? 1,
        })),
        startedAtUtc: startedAt ?? new Date().toISOString(),
        tabSwitchCount: 0,
      });
      setResult({ ...response, timedOut: timedOut || response.timedOut });
      setPhase("review");
      if (response.passed) {
        onPassed?.();
      }
      const nextStatus = await fetchLessonExerciseStatus(Number(lessonId));
      setStatus(nextStatus);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nop bai that bai.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (phase !== "quiz" || !exercise?.timeLimit) return;
    if (timeLeft <= 0) {
      void submit(true);
      return;
    }
    const timer = window.setInterval(() => setTimeLeft((value) => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [phase, timeLeft, exercise?.timeLimit]);

  return {
    exercise,
    phase,
    setPhase,
    currentIndex,
    setCurrentIndex,
    answers,
    setAnswers,
    timeLeft,
    status,
    result,
    startedAt,
    setStartedAt,
    loading,
    question,
    startQuiz,
    submit,
  } as const;
}
