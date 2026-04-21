import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Award, RefreshCw, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { CourseExercise, QuizQuestion } from '../../data/lessons';
import { useLearning } from '../../contexts/LearningContext';

interface Props {
  exercise: CourseExercise;
  courseId: string;
  lessonId: string;
  onPassed?: () => void;
}

type Phase = 'intro' | 'quiz' | 'review';

export default function ExercisePanel({ exercise, courseId, lessonId, onPassed }: Props) {
  const { getAttempt, saveAttempt } = useLearning();
  const prevAttempt = getAttempt(courseId, exercise.id);

  const [phase, setPhase] = useState<Phase>(prevAttempt ? 'review' : 'intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState(exercise.timeLimit * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [result, setResult] = useState(prevAttempt);
  const [showExplanation, setShowExplanation] = useState<string | null>(null);

  // Timer
  useEffect(() => {
    if (!timerActive || exercise.timeLimit === 0) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [timerActive, timeLeft]);

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setAnswers({});
    setCurrentQ(0);
    setTimeLeft(exercise.timeLimit * 60);
    setTimerActive(exercise.timeLimit > 0);
    setPhase('quiz');
  };

  const handleAnswer = (qId: string, value: string, type: QuizQuestion['type']) => {
    setAnswers(prev => {
      if (type === 'multiple') {
        const current = (prev[qId] as string[]) ?? [];
        const exists = current.includes(value);
        return {
          ...prev,
          [qId]: exists ? current.filter(v => v !== value) : [...current, value],
        };
      }
      return { ...prev, [qId]: value };
    });
  };

  const isAnswered = (qId: string) => {
    const a = answers[qId];
    if (!a) return false;
    if (Array.isArray(a)) return a.length > 0;
    return true;
  };

  const handleSubmit = () => {
    setTimerActive(false);
    let totalPoints = 0;
    let earnedPoints = 0;

    exercise.questions.forEach(q => {
      totalPoints += q.points;
      const userAns = answers[q.id];
      const correct = q.correctAnswer;

      if (Array.isArray(correct) && Array.isArray(userAns)) {
        const sorted = [...correct].sort();
        const userSorted = [...userAns].sort();
        if (JSON.stringify(sorted) === JSON.stringify(userSorted)) earnedPoints += q.points;
      } else if (userAns === correct) {
        earnedPoints += q.points;
      }
    });

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = score >= exercise.passingScore;

    const attempt = {
      exerciseId: exercise.id,
      courseId,
      lessonId,
      answers,
      score,
      passed,
      completedAt: new Date().toISOString(),
    };

    saveAttempt(attempt);
    setResult(attempt);
    setPhase('review');
    if (passed && onPassed) onPassed();
  };

  const isCorrect = (q: QuizQuestion) => {
    const userAns = result?.answers[q.id];
    const correct = q.correctAnswer;
    if (Array.isArray(correct) && Array.isArray(userAns)) {
      return JSON.stringify([...correct].sort()) === JSON.stringify([...userAns].sort());
    }
    return userAns === correct;
  };

  const q = exercise.questions[currentQ];
  const allAnswered = exercise.questions.every(q => isAnswered(q.id));

  // ── Intro phase ──
  if (phase === 'intro') {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🧪</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{exercise.title}</h2>
              <p className="text-sm text-gray-500">{exercise.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{exercise.questions.length}</p>
              <p className="text-sm text-blue-700">Câu hỏi</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">
                {exercise.timeLimit > 0 ? `${exercise.timeLimit} phút` : '∞'}
              </p>
              <p className="text-sm text-orange-700">Thời gian</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{exercise.passingScore}%</p>
              <p className="text-sm text-green-700">Điểm qua</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Hướng dẫn:</h3>
            <ul className="text-sm text-gray-600 space-y-1.5">
              <li className="flex items-start gap-2"><ChevronRight className="size-4 text-blue-400 mt-0.5 shrink-0" />Đọc kỹ từng câu hỏi trước khi trả lời</li>
              <li className="flex items-start gap-2"><ChevronRight className="size-4 text-blue-400 mt-0.5 shrink-0" />Câu hỏi "multiple" – chọn tất cả đáp án đúng</li>
              <li className="flex items-start gap-2"><ChevronRight className="size-4 text-blue-400 mt-0.5 shrink-0" />Sau khi nộp, bạn sẽ thấy giải thích cho từng câu</li>
              {exercise.timeLimit > 0 && <li className="flex items-start gap-2"><ChevronRight className="size-4 text-orange-400 mt-0.5 shrink-0" />Thời gian giới hạn: {exercise.timeLimit} phút</li>}
            </ul>
          </div>

          {prevAttempt && (
            <div className={`rounded-xl p-4 mb-4 flex items-center gap-3 ${prevAttempt.passed ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
              {prevAttempt.passed
                ? <CheckCircle className="size-5 text-green-600 shrink-0" />
                : <AlertCircle className="size-5 text-orange-600 shrink-0" />}
              <p className="text-sm">
                Lần làm trước: <strong>{prevAttempt.score}%</strong>
                {prevAttempt.passed ? ' – Đã qua ✓' : ' – Chưa qua'}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleStart}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              {prevAttempt ? '🔄 Làm lại bài kiểm tra' : '🚀 Bắt đầu làm bài'}
            </button>
            {prevAttempt && (
              <button
                onClick={() => setPhase('review')}
                className="px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition text-sm"
              >
                Xem kết quả cũ
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz phase ──
  if (phase === 'quiz') {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500">
                Câu {currentQ + 1} / {exercise.questions.length}
              </span>
              <div className="flex gap-1">
                {exercise.questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQ(i)}
                    className={`size-2 rounded-full transition ${
                      i === currentQ ? 'bg-blue-600 w-4' : isAnswered(exercise.questions[i].id) ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            {exercise.timeLimit > 0 && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-mono ${
                timeLeft < 60 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-gray-100 text-gray-700'
              }`}>
                <Clock className="size-3.5" />
                {formatTimer(timeLeft)}
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 h-1 rounded-full mb-6">
            <div
              className="bg-blue-500 h-1 rounded-full transition-all"
              style={{ width: `${((currentQ + 1) / exercise.questions.length) * 100}%` }}
            />
          </div>

          {/* Question */}
          <div className="mb-6">
            <div className="flex items-start gap-2 mb-4">
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded font-medium shrink-0 mt-0.5">
                {q.type === 'multiple' ? 'Nhiều lựa chọn' : q.type === 'true_false' ? 'Đúng / Sai' : 'Một lựa chọn'}
              </span>
              <span className="text-xs text-gray-500">{q.points} điểm</span>
            </div>
            <p className="text-gray-900 leading-relaxed">{q.question}</p>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {q.options.map((opt, idx) => {
              const selected = q.type === 'multiple'
                ? ((answers[q.id] as string[]) ?? []).includes(opt)
                : answers[q.id] === opt;

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(q.id, opt, q.type)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition
                    ${selected
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700'}`}
                >
                  <div className={`shrink-0 size-5 rounded-${q.type === 'multiple' ? 'md' : 'full'} border-2 flex items-center justify-center transition
                    ${selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                    {selected && (
                      <div className={`bg-white ${q.type === 'multiple' ? 'size-2.5 rounded-sm' : 'size-2.5 rounded-full'}`} />
                    )}
                  </div>
                  <span className="text-sm leading-snug">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
              disabled={currentQ === 0}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm"
            >
              <ChevronLeft className="size-4" /> Câu trước
            </button>

            {currentQ < exercise.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQ(q => q + 1)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm"
              >
                Câu tiếp <ChevronRight className="size-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm font-semibold"
              >
                Nộp bài ✓
              </button>
            )}
          </div>

          {!allAnswered && currentQ === exercise.questions.length - 1 && (
            <p className="text-center text-xs text-orange-600 mt-3">
              ⚠ Còn {exercise.questions.filter(q => !isAnswered(q.id)).length} câu chưa trả lời
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Review phase ──
  if (phase === 'review' && result) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          {/* Score card */}
          <div className={`rounded-2xl p-6 mb-6 text-center ${
            result.passed
              ? 'bg-gradient-to-br from-green-500 to-emerald-600'
              : 'bg-gradient-to-br from-orange-500 to-red-500'
          } text-white`}>
            <div className="text-5xl mb-3">{result.passed ? '🏆' : '💪'}</div>
            <p className="text-xl font-bold mb-1">
              {result.passed ? 'Xuất sắc! Bạn đã qua bài kiểm tra!' : 'Chưa đạt. Hãy thử lại nhé!'}
            </p>
            <p className="text-white/80 text-sm mb-4">
              Điểm của bạn: <strong>{result.score}%</strong> · Cần đạt: {exercise.passingScore}%
            </p>
            <div className="flex justify-center gap-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">
                ✓ {exercise.questions.filter(q => isCorrect(q)).length} đúng
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full">
                ✗ {exercise.questions.filter(q => !isCorrect(q)).length} sai
              </span>
            </div>
          </div>

          {/* Award badge */}
          {result.passed && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <Award className="size-8 text-yellow-600 shrink-0" />
              <div>
                <p className="font-semibold text-yellow-900">🎉 Đã nhận huy hiệu chương!</p>
                <p className="text-sm text-yellow-700">Tiếp tục học để mở khóa thêm nội dung</p>
              </div>
            </div>
          )}

          {/* Detailed review */}
          <h3 className="font-bold text-gray-900 mb-4">Xem lại từng câu:</h3>
          <div className="space-y-4 mb-6">
            {exercise.questions.map((q, idx) => {
              const correct = isCorrect(q);
              const userAns = result.answers[q.id];
              const show = showExplanation === q.id;

              return (
                <div key={q.id} className={`rounded-xl border-2 overflow-hidden ${
                  correct ? 'border-green-200' : 'border-red-200'
                }`}>
                  <div className={`flex items-start gap-3 p-4 ${correct ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="shrink-0 mt-0.5">
                      {correct
                        ? <CheckCircle className="size-5 text-green-600" />
                        : <XCircle className="size-5 text-red-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Câu {idx + 1}: {q.question}
                      </p>
                      <div className="space-y-1 text-xs">
                        <p className={correct ? 'text-green-700' : 'text-red-700'}>
                          Bạn chọn: {Array.isArray(userAns) ? userAns.join(', ') || '(chưa trả lời)' : (userAns ?? '(chưa trả lời)')}
                        </p>
                        {!correct && (
                          <p className="text-green-700 font-medium">
                            Đáp án đúng: {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowExplanation(show ? null : q.id)}
                      className="text-xs text-blue-600 hover:underline shrink-0"
                    >
                      {show ? 'Ẩn' : 'Giải thích'}
                    </button>
                  </div>
                  {show && (
                    <div className="px-4 py-3 bg-white border-t border-gray-100">
                      <p className="text-sm text-gray-700 flex gap-2">
                        <span className="text-blue-500">💡</span>
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleStart}
              className="flex-1 flex items-center justify-center gap-2 border border-gray-300 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition"
            >
              <RefreshCw className="size-4" /> Làm lại
            </button>
            <button
              onClick={() => setPhase('intro')}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
            >
              Quay lại bài <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
