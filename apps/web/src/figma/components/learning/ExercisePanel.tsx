"use client";

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Award, CheckCircle, ChevronLeft, ChevronRight, Clock, RefreshCw, XCircle } from 'lucide-react';
import { fetchLessonExerciseStatus, submitLessonExercise, type LearningLesson, type LessonExerciseResultDto, type LessonExerciseStatusDto } from '../../data/api';
import { toast } from '@/figma/compat/sonner';

interface Props {
  lesson: LearningLesson;
  courseId: string;
  lessonId: string;
  onPassed?: () => void;
}

type Phase = 'intro' | 'quiz' | 'review';

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remain = seconds % 60;
  return `${minutes}:${String(remain).padStart(2, '0')}`;
}

export default function ExercisePanel({ lesson, lessonId, onPassed }: Props) {
  const exercise = lesson.exercise;
  const [phase, setPhase] = useState<Phase>('intro');
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
            setPhase('intro');
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

  useEffect(() => {
    if (phase !== 'quiz' || !exercise?.timeLimit) return;
    if (timeLeft <= 0) {
      void handleSubmit(true);
      return;
    }
    const timer = window.setInterval(() => setTimeLeft((value) => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [phase, timeLeft, exercise?.timeLimit]);

  const question = useMemo(() => exercise?.questions[currentIndex], [exercise, currentIndex]);
  const allAnswered = useMemo(() => exercise?.questions.every((item) => answers[item.numericId]) ?? false, [answers, exercise]);

  if (!exercise) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-gray-400">
        Bai hoc nay chua co bai tap.
      </div>
    );
  }

  const startQuiz = () => {
    setPhase('quiz');
    setAnswers({});
    setCurrentIndex(0);
    setTimeLeft(exercise.timeLimit * 60);
    setResult(null);
    setStartedAt(new Date().toISOString());
  };

  const handleSubmit = async (timedOut = false) => {
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
      setPhase('review');
      if (response.passed) {
        onPassed?.();
      }
      const nextStatus = await fetchLessonExerciseStatus(Number(lessonId));
      setStatus(nextStatus);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nop bai that bai.');
    } finally {
      setLoading(false);
    }
  };

  if (phase === 'intro') {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-orange-100 text-2xl">🧪</div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{exercise.title}</h2>
              <p className="text-sm text-gray-500">{exercise.description}</p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-blue-50 p-4 text-center"><p className="text-2xl font-bold text-blue-600">{exercise.questions.length}</p><p className="text-sm text-blue-700">Cau hoi</p></div>
            <div className="rounded-xl bg-orange-50 p-4 text-center"><p className="text-2xl font-bold text-orange-600">{exercise.timeLimit > 0 ? `${exercise.timeLimit} phut` : '∞'}</p><p className="text-sm text-orange-700">Thoi gian</p></div>
            <div className="rounded-xl bg-green-50 p-4 text-center"><p className="text-2xl font-bold text-green-600">{exercise.passingScore}%</p><p className="text-sm text-green-700">Diem dat</p></div>
          </div>

          {status && status.attemptCount > 0 && (
            <div className={`mb-4 flex items-center gap-3 rounded-xl border p-4 ${status.passed ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
              {status.passed ? <CheckCircle className="size-5 text-green-600" /> : <AlertCircle className="size-5 text-orange-600" />}
              <p className="text-sm text-gray-700">
                Lan gan nhat: <strong>{Math.round(status.lastScorePercent ?? 0)}%</strong> · {status.passed ? 'Da dat' : 'Chua dat'} · {status.attemptCount} lan thu
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={startQuiz} className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700">
              {status?.attemptCount ? 'Lam lai bai quiz' : 'Bat dau lam bai'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'quiz' && question) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Cau {currentIndex + 1} / {exercise.questions.length}</span>
            {exercise.timeLimit > 0 && (
              <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-mono ${timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                <Clock className="size-3.5" /> {formatTimer(timeLeft)}
              </div>
            )}
          </div>

          <div className="mb-6 h-1 rounded-full bg-gray-200">
            <div className="h-1 rounded-full bg-blue-500 transition-all" style={{ width: `${((currentIndex + 1) / exercise.questions.length) * 100}%` }} />
          </div>

          <p className="mb-4 text-lg font-semibold text-gray-900">{question.question}</p>
          <div className="mb-8 space-y-3">
            {question.options.map((option, index) => {
              const optionValue = index + 1;
              const selected = answers[question.numericId] === optionValue;
              return (
                <button
                  key={`${question.id}-${optionValue}`}
                  onClick={() => setAnswers((prev) => ({ ...prev, [question.numericId]: optionValue }))}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition ${selected ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
                >
                  <div className={`flex size-5 items-center justify-center rounded-full border-2 ${selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                    {selected && <div className="size-2.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm">{option}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <button disabled={currentIndex === 0} onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))} className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
              <ChevronLeft className="size-4" /> Cau truoc
            </button>
            {currentIndex < exercise.questions.length - 1 ? (
              <button onClick={() => setCurrentIndex((value) => value + 1)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700">
                Cau tiep <ChevronRight className="size-4" />
              </button>
            ) : (
              <button disabled={!allAnswered || loading} onClick={() => void handleSubmit(false)} className="rounded-xl bg-green-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40">
                {loading ? 'Dang nop...' : 'Nop bai'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl">
        <div className={`mb-6 rounded-2xl p-6 text-center text-white ${result.passed ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-orange-500 to-red-500'}`}>
          <div className="mb-3 text-5xl">{result.passed ? '🏆' : '💪'}</div>
          <p className="mb-1 text-xl font-bold">{result.passed ? 'Ban da qua bai quiz' : 'Ban chua dat bai quiz'}</p>
          <p className="text-sm text-white/80">Diem cua ban: <strong>{Math.round(result.scorePercent)}%</strong> · Can dat: {result.passingPercent}%</p>
          {result.passed && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-sm">
              <Award className="size-4" /> Progress da duoc cap nhat vao backend
            </div>
          )}
        </div>

        <div className="mb-6 space-y-4">
          {result.questionResults.map((item, index) => (
            <div key={`${item.questionId}-${index}`} className={`rounded-xl border-2 p-4 ${item.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="mb-2 flex items-start gap-2">
                {item.isCorrect ? <CheckCircle className="mt-0.5 size-5 text-green-600" /> : <XCircle className="mt-0.5 size-5 text-red-500" />}
                <div>
                  <p className="font-medium text-gray-900">{item.question}</p>
                  <p className="mt-1 text-sm text-gray-600">Ban chon: {item.selectedOption} · Dap an dung: {item.correctOption}</p>
                  {!!item.explanation && <p className="mt-2 text-sm text-gray-600">{item.explanation}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={() => setPhase('intro')} className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50">
            <RefreshCw className="size-4" /> Lam lai
          </button>
        </div>
      </div>
    </div>
  );
}


