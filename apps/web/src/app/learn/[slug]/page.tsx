"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { API_URL, resolveApiAsset } from "@/lib/api";

interface LessonExerciseQuestion {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  sortOrder: number;
}

interface LessonExercise {
  passingPercent: number;
  timeLimitSeconds: number;
  maxTabSwitches: number;
  questions: LessonExerciseQuestion[];
}

interface Lesson {
  id: number;
  title: string;
  contentType?: string;
  durationMinutes: number;
  videoUrl?: string | null;
  hasExercise?: boolean;
  exercise?: LessonExercise | null;
}

interface CourseDetail {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  outcome: string;
  requirements: string;
  price: number;
  thumbnailUrl: string;
  previewVideoUrl?: string | null;
  lessons: Lesson[];
}

interface Enrollment {
  id: number;
  courseSlug: string;
  courseTitle: string;
  lastLessonId?: number | null;
  totalLessons?: number;
  completedLessons?: number;
  progressPercent?: number;
}

interface ProgressSnapshot {
  courseId: number;
  lastLessonId: number | null;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  completedLessonIds: number[];
}

interface LessonExerciseResult {
  isCorrect: boolean;
  passed: boolean;
  attemptCount: number;
  scorePercent: number;
  passingPercent: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  allowedTimeSeconds: number;
  timedOut: boolean;
  tabSwitchCount: number;
  allowedTabSwitches: number;
  tabViolation: boolean;
  messageCode: string;
  message: string;
  questionResults: LessonExerciseQuestionResult[];
}

interface LessonExerciseQuestionResult {
  questionId: number;
  question: string;
  selectedOption: number;
  correctOption: number;
  isCorrect: boolean;
  explanation: string;
}

interface LessonExerciseStatus {
  lessonId: number;
  passed: boolean;
  attemptCount: number;
  bestScorePercent: number;
  lastScorePercent?: number | null;
  lastCorrectAnswers?: number | null;
  lastTotalQuestions?: number | null;
  lastPassed?: boolean | null;
  lastTimedOut?: boolean | null;
  lastTabViolation?: boolean | null;
  lastTabSwitchCount?: number | null;
  passingPercent: number;
  timeLimitSeconds: number;
  maxTabSwitches: number;
  lastAttemptedAt?: string | null;
}

function getEmbedUrl(url?: string | null) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();

    if (path.endsWith(".mp4") || path.endsWith(".webm") || path.endsWith(".m3u8")) {
      return null;
    }

    if (host.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (parsed.pathname.startsWith("/embed/")) {
        return url;
      }
    }

    if (host.includes("youtu.be")) {
      const videoId = parsed.pathname.replace("/", "");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if (host.includes("cloudflarestream.com") || host.includes("videodelivery.net")) {
      return url;
    }

    return null;
  } catch {
    return null;
  }
}

type LearnLocale = "vi" | "en";

const TEXT: Record<LearnLocale, Record<string, string>> = {
  en: {
    loadingLesson: "Loading your lesson...",
    notFound: "We could not find this course.",
    signInTitle: "Sign in to start learning",
    signInDesc: "You need an account to access the course player.",
    signIn: "Sign in",
    enrollDesc: "Enroll to unlock {count} lessons and the full course player.",
    viewCourse: "View course details",
    myLearning: "My learning",
    resume: "Pick up where you left off.",
    courseDetails: "Course details",
    exerciseStep: "Exercise step",
    exerciseStepDesc: "This lesson is a practice checkpoint. Finish the exercise below to continue.",
    noVideo: "No video available yet.",
    lessonLabel: "Lesson",
    estimate: "Estimated time {minutes} minutes.",
    selectLesson: "Select a lesson to begin.",
    answerToComplete: "Answer exercise to complete",
    markIncomplete: "Mark incomplete",
    markComplete: "Mark complete",
    previous: "Previous",
    nextLocked: "Next locked",
    nextLesson: "Next lesson",
    unlockNext: "Complete this exercise to unlock the next lesson.",
    upNext: "Up next: {title} ({type})",
    lessonExercise: "Lesson exercise",
    submit: "Submit answers",
    checking: "Checking...",
    notConfigured: "This exercise is not configured yet.",
    attempts: "Attempts: {count}",
    statusPassed: "Status: Passed",
    statusPending: "Status: Not passed yet",
    bestScore: "Best score: {score}%",
    lastAttempt: "Last attempt: {time}",
    score: "Score: {score}% ({correct}/{total})",
    passNeed: "Pass requirement: {percent}%",
    timeSpent: "Time spent: {spent}s",
    timedOut: "Result: Timed out",
    tabWarn: "Tab switches: {used}/{max}",
    tabViolated: "Result: Failed due to tab switching limit",
    yourProgress: "Your progress",
    lessonsCompleted: "{completed}/{total} lessons completed",
    completePercent: "{percent}% complete",
    lessons: "Lessons",
    lessonCount: "{count} lessons",
    done: "Done",
    locked: "Locked",
    help: "Need help? Visit the community or contact your instructor for guidance.",
    chooseLanguage: "Language",
    questionLabel: "Question {index}",
    yourAnswer: "Your answer",
    correctAnswer: "Correct answer",
    noAnswer: "No answer",
    option: "Option {label}",
    submitFailed: "Could not submit this exercise right now. Please try again.",
    msg_passed: "Excellent work. You passed this exercise.",
    msg_timed_out: "Time is up for this exercise. Please try again.",
    msg_tab_violation: "Exercise locked because the tab was switched too many times.",
    msg_failed: "Not passed yet. Review and try again.",
    msg_submit_failed: "Could not submit this exercise right now. Please try again.",
  },
  vi: {
    loadingLesson: "Dang tai bai hoc...",
    notFound: "Khong tim thay khoa hoc nay.",
    signInTitle: "Dang nhap de bat dau hoc",
    signInDesc: "Ban can tai khoan de mo trinh phat khoa hoc.",
    signIn: "Dang nhap",
    enrollDesc: "Dang ky de mo khoa hoc gom {count} bai hoc.",
    viewCourse: "Xem chi tiet khoa hoc",
    myLearning: "Khoa hoc cua toi",
    resume: "Tiep tuc tu bai ban dang hoc.",
    courseDetails: "Chi tiet khoa hoc",
    exerciseStep: "Buoc bai tap",
    exerciseStepDesc: "Day la moc luyen tap. Hoan thanh bai tap de tiep tuc.",
    noVideo: "Chua co video cho bai hoc nay.",
    lessonLabel: "Bai hoc",
    estimate: "Thoi gian du kien {minutes} phut.",
    selectLesson: "Hay chon bai hoc de bat dau.",
    answerToComplete: "Lam bai tap de hoan thanh",
    markIncomplete: "Danh dau chua xong",
    markComplete: "Danh dau da xong",
    previous: "Bai truoc",
    nextLocked: "Khoa bai tiep theo",
    nextLesson: "Bai tiep theo",
    unlockNext: "Hoan thanh bai tap nay de mo bai tiep theo.",
    upNext: "Sap hoc: {title} ({type})",
    lessonExercise: "Bai tap trong bai hoc",
    submit: "Nop bai",
    checking: "Dang cham...",
    notConfigured: "Bai tap nay chua duoc cau hinh.",
    attempts: "So lan lam: {count}",
    statusPassed: "Trang thai: Dat",
    statusPending: "Trang thai: Chua dat",
    bestScore: "Diem cao nhat: {score}%",
    lastAttempt: "Lan nop gan nhat: {time}",
    score: "Diem: {score}% ({correct}/{total})",
    passNeed: "Muc dat yeu cau: {percent}%",
    timeSpent: "Thoi gian lam: {spent} giay",
    timedOut: "Ket qua: Het gio",
    tabWarn: "So lan doi tab: {used}/{max}",
    tabViolated: "Ket qua: Khong dat vi doi tab qua gioi han",
    yourProgress: "Tien do cua ban",
    lessonsCompleted: "Da xong {completed}/{total} bai hoc",
    completePercent: "Hoan thanh {percent}%",
    lessons: "Danh sach bai hoc",
    lessonCount: "{count} bai hoc",
    done: "Xong",
    locked: "Khoa",
    help: "Can ho tro? Hay vao cong dong hoac lien he giang vien.",
    chooseLanguage: "Ngon ngu",
    questionLabel: "Cau hoi {index}",
    yourAnswer: "Ban chon",
    correctAnswer: "Dap an dung",
    noAnswer: "Chua chon",
    option: "Lua chon {label}",
    submitFailed: "Khong the nop bai luc nay. Vui long thu lai.",
    msg_passed: "Lam rat tot. Ban da dat bai tap nay.",
    msg_timed_out: "Ban da het thoi gian lam bai. Hay thu lai.",
    msg_tab_violation: "Bai tap bi khoa vi doi tab qua so lan cho phep.",
    msg_failed: "Chua dat. Hay on lai va thu lai.",
    msg_submit_failed: "Khong the nop bai luc nay. Vui long thu lai.",
  },
};

function formatTemplate(template: string, params: Record<string, string | number>) {
  return Object.entries(params).reduce((result, [key, value]) => result.replace(`{${key}}`, String(value)), template);
}

function formatSeconds(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function LearnPage() {
  const params = useParams<{ slug?: string | string[] }>();
  const slugParam = params?.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedExerciseOptions, setSelectedExerciseOptions] = useState<Record<number, number>>({});
  const [exerciseResult, setExerciseResult] = useState<LessonExerciseResult | null>(null);
  const [exerciseStatus, setExerciseStatus] = useState<LessonExerciseStatus | null>(null);
  const [isSubmittingExercise, setIsSubmittingExercise] = useState(false);
  const [exerciseStartedAt, setExerciseStartedAt] = useState<string | null>(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [locale, setLocale] = useState<LearnLocale>("vi");

  const t = (key: string, params?: Record<string, string | number>) => {
    const value = TEXT[locale][key] ?? key;
    return params ? formatTemplate(value, params) : value;
  };
  const getResultMessage = (result: LessonExerciseResult) => {
    const messageKey = `msg_${result.messageCode}`;
    return TEXT[locale][messageKey] ?? result.message;
  };

  const applySnapshot = (snapshot: ProgressSnapshot) => {
    setCompletedLessonIds(snapshot.completedLessonIds ?? []);
    setCompletedLessons(snapshot.completedLessons ?? 0);
    setTotalLessons(snapshot.totalLessons ?? 0);
    setProgressPercent(snapshot.progressPercent ?? 0);
  };

  const syncProgress = async (
    payload: { courseId: number; lessonId: number; isCompleted?: boolean; setAsLast?: boolean },
    token: string
  ) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`${API_URL}/api/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const snapshot = (await res.json()) as ProgressSnapshot;
        applySnapshot(snapshot);
      } else if (res.status === 401 || res.status === 403) {
        setNeedsAuth(true);
        setIsEnrolled(false);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const refreshProgressSnapshot = async (courseId: number, token: string) => {
    const progressRes = await fetch(`${API_URL}/api/progress/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!progressRes.ok) return;

    const snapshot = (await progressRes.json()) as ProgressSnapshot;
    applySnapshot(snapshot);
  };

  useEffect(() => {
    const storedLocale = localStorage.getItem("app:locale") ?? localStorage.getItem("learn:locale");
    if (storedLocale === "vi" || storedLocale === "en") {
      setLocale(storedLocale);
      return;
    }

    const browser = navigator.language.toLowerCase();
    setLocale(browser.startsWith("vi") ? "vi" : "en");
  }, []);

  useEffect(() => {
    localStorage.setItem("learn:locale", locale);
  }, [locale]);

  useEffect(() => {
    let isActive = true;

    const loadCourse = async () => {
      setIsLoading(true);
      setNeedsAuth(false);

      try {
        if (!slug) {
          return;
        }

        const token = localStorage.getItem("token");
        const courseRes = await fetch(`${API_URL}/api/courses/${slug}`, {
          cache: "no-store",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!courseRes.ok) {
          if (isActive) {
            setCourse(null);
          }
          return;
        }

        const courseData = (await courseRes.json()) as CourseDetail;
        if (!isActive) return;
        setCourse(courseData);
        setTotalLessons(courseData.lessons?.length ?? 0);
        const storageKey = `learn:lastLesson:${courseData.slug}`;
        const storedLessonId = Number(localStorage.getItem(storageKey));
        const storedLesson = courseData.lessons?.find((lesson) => lesson.id === storedLessonId);
        setSelectedLessonId(storedLesson?.id ?? courseData.lessons?.[0]?.id ?? null);

        if (!token) {
          setNeedsAuth(true);
          setIsEnrolled(false);
          return;
        }

        const enrollmentsRes = await fetch(`${API_URL}/api/enrollments/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!isActive) return;

        if (enrollmentsRes.status === 401 || enrollmentsRes.status === 403) {
          setNeedsAuth(true);
          setIsEnrolled(false);
          return;
        }

        if (enrollmentsRes.ok) {
          const enrollments = (await enrollmentsRes.json()) as Enrollment[];
          const match = enrollments.find((item) => item.courseSlug === courseData.slug);
          const enrolled = Boolean(match);
          setIsEnrolled(enrolled);
          if (match) {
            setCompletedLessons(match.completedLessons ?? 0);
            setTotalLessons(match.totalLessons ?? courseData.lessons?.length ?? 0);
            setProgressPercent(match.progressPercent ?? 0);
            if (match.lastLessonId) {
              setSelectedLessonId(match.lastLessonId);
            }

            const progressRes = await fetch(`${API_URL}/api/progress/${courseData.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (progressRes.ok) {
              const snapshot = (await progressRes.json()) as ProgressSnapshot;
              applySnapshot(snapshot);
              if (snapshot.lastLessonId) {
                setSelectedLessonId(snapshot.lastLessonId);
              }
            }
          }
        } else {
          setIsEnrolled(false);
        }
      } catch {
        if (isActive) {
          setCourse(null);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadCourse();

    return () => {
      isActive = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!course || !selectedLessonId) return;
    const storageKey = `learn:lastLesson:${course.slug}`;
    localStorage.setItem(storageKey, String(selectedLessonId));
  }, [course, selectedLessonId]);

  useEffect(() => {
    if (!course || !selectedLessonId || !isEnrolled) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    syncProgress(
      {
        courseId: course.id,
        lessonId: selectedLessonId,
        setAsLast: true,
      },
      token
    );
  }, [course, selectedLessonId, isEnrolled]);

  const currentLesson = useMemo(() => {
    if (!course) return null;
    return course.lessons.find((lesson) => lesson.id === selectedLessonId) ?? course.lessons[0] ?? null;
  }, [course, selectedLessonId]);

  const isLessonCompleted = currentLesson ? completedLessonIds.includes(currentLesson.id) : false;

  const currentIndex = useMemo(() => {
    if (!course || !currentLesson) return -1;
    return course.lessons.findIndex((lesson) => lesson.id === currentLesson.id);
  }, [course, currentLesson]);

  const previousLesson = useMemo(() => {
    if (!course || currentIndex <= 0) return null;
    return course.lessons[currentIndex - 1] ?? null;
  }, [course, currentIndex]);

  const nextLesson = useMemo(() => {
    if (!course || currentIndex < 0) return null;
    return course.lessons[currentIndex + 1] ?? null;
  }, [course, currentIndex]);

  const currentLessonType = (currentLesson?.contentType ?? "video").toLowerCase();
  const isExerciseLesson = currentLessonType === "exercise";

  const currentExercise = isExerciseLesson && currentLesson?.hasExercise
    ? currentLesson.exercise ?? null
    : null;

  const exerciseQuestions = useMemo(() => {
    if (!currentExercise) return [];
    return [...(currentExercise.questions ?? [])]
      .filter((question) =>
        Boolean(question.question)
        && Boolean(question.optionA)
        && Boolean(question.optionB)
        && Boolean(question.optionC)
        && Boolean(question.optionD)
      )
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [currentExercise]);

  const exerciseReady = isExerciseLesson && exerciseQuestions.length > 0;
  const answeredCount = useMemo(
    () => exerciseQuestions.filter((question) => Boolean(selectedExerciseOptions[question.id])).length,
    [exerciseQuestions, selectedExerciseOptions]
  );
  const isExerciseGateActive = exerciseReady && !isLessonCompleted;
  const effectiveTimeLimitSeconds = exerciseStatus?.timeLimitSeconds ?? currentExercise?.timeLimitSeconds ?? 0;
  const effectiveMaxTabSwitches = exerciseStatus?.maxTabSwitches ?? currentExercise?.maxTabSwitches ?? 0;

  const submitExercise = async (reason: "manual" | "timeout" | "tab_limit" = "manual") => {
    if (!course || !currentLesson || !exerciseReady || isSubmittingExercise) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      setIsEnrolled(false);
      return;
    }

    setIsSubmittingExercise(true);
    try {
      const answers = exerciseQuestions
        .map((question) => ({
          questionId: question.id,
          selectedOption: selectedExerciseOptions[question.id],
        }))
        .filter((answer): answer is { questionId: number; selectedOption: number } => Boolean(answer.selectedOption));

      const fallbackSelectedOption = answers[0]?.selectedOption ?? null;

      const res = await fetch(`${API_URL}/api/lessons/${currentLesson.id}/exercise/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          selectedOption: fallbackSelectedOption,
          answers,
          startedAtUtc: exerciseStartedAt,
          tabSwitchCount,
          reason,
        }),
      });

      if (res.status === 401 || res.status === 403) {
        setNeedsAuth(true);
        setIsEnrolled(false);
        return;
      }

      if (!res.ok) {
        setExerciseResult({
          isCorrect: false,
          passed: false,
          attemptCount: exerciseStatus?.attemptCount ?? 0,
          scorePercent: 0,
          passingPercent: currentExercise?.passingPercent ?? 80,
          correctAnswers: 0,
          totalQuestions: exerciseQuestions.length,
          timeSpentSeconds: 0,
          allowedTimeSeconds: effectiveTimeLimitSeconds,
          timedOut: false,
          tabSwitchCount,
          allowedTabSwitches: effectiveMaxTabSwitches,
          tabViolation: false,
          messageCode: "submit_failed",
          message: t("submitFailed"),
          questionResults: [],
        });
        return;
      }

      const result = (await res.json()) as LessonExerciseResult;
      setExerciseResult(result);
      setExerciseStatus({
        lessonId: currentLesson.id,
        passed: result.passed,
        attemptCount: result.attemptCount,
        bestScorePercent: Math.max(result.scorePercent, exerciseStatus?.bestScorePercent ?? 0),
        lastScorePercent: result.scorePercent,
        lastCorrectAnswers: result.correctAnswers,
        lastTotalQuestions: result.totalQuestions,
        lastPassed: result.passed,
        lastTimedOut: result.timedOut,
        lastTabViolation: result.tabViolation,
        lastTabSwitchCount: result.tabSwitchCount,
        passingPercent: result.passingPercent,
        timeLimitSeconds: result.allowedTimeSeconds,
        maxTabSwitches: result.allowedTabSwitches,
        lastAttemptedAt: new Date().toISOString(),
      });
      await refreshProgressSnapshot(course.id, token);
    } finally {
      setIsSubmittingExercise(false);
    }
  };

  useEffect(() => {
    setSelectedExerciseOptions({});
    setExerciseResult(null);
    setExerciseStatus(null);
    setTabSwitchCount(0);
    setExerciseStartedAt(currentLesson ? new Date().toISOString() : null);
    setRemainingSeconds(currentExercise?.timeLimitSeconds && currentExercise.timeLimitSeconds > 0 ? currentExercise.timeLimitSeconds : null);
  }, [currentLesson?.id, currentExercise?.timeLimitSeconds]);

  useEffect(() => {
    const loadExerciseStatus = async () => {
      if (!currentLesson || !exerciseReady) return;
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_URL}/api/lessons/${currentLesson.id}/exercise/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;

      const status = (await res.json()) as LessonExerciseStatus;
      setExerciseStatus(status);
      if (status.timeLimitSeconds > 0) {
        setRemainingSeconds(status.timeLimitSeconds);
      }
    };

    loadExerciseStatus();
  }, [currentLesson?.id, exerciseReady]);

  useEffect(() => {
    if (!exerciseReady || !currentLesson || !effectiveTimeLimitSeconds || exerciseResult?.passed) return;
    if (remainingSeconds === null) return;
    if (remainingSeconds <= 0) {
      submitExercise("timeout");
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null) return null;
        return Math.max(0, prev - 1);
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [exerciseReady, currentLesson?.id, effectiveTimeLimitSeconds, remainingSeconds, exerciseResult?.passed]);

  useEffect(() => {
    if (!exerciseReady || !currentLesson || exerciseResult?.passed) return;

    const onVisibilityChange = () => {
      if (!document.hidden) return;
      setTabSwitchCount((prev) => prev + 1);
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [exerciseReady, currentLesson?.id, exerciseResult?.passed]);

  useEffect(() => {
    if (!exerciseReady || !currentLesson || exerciseResult?.passed) return;
    if (effectiveMaxTabSwitches <= 0) return;
    if (tabSwitchCount <= effectiveMaxTabSwitches) return;

    submitExercise("tab_limit");
  }, [exerciseReady, currentLesson?.id, tabSwitchCount, effectiveMaxTabSwitches, exerciseResult?.passed]);

  if (isLoading) {
    return (
      <div className="section-shell py-12 fade-in">
        <div className="surface-card rounded-3xl p-10 text-center text-sm text-emerald-800/70">
          {t("loadingLesson")}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="section-shell py-12 fade-in">
        <div className="surface-card rounded-3xl p-10 text-center text-sm text-emerald-800/70">
          {t("notFound")}
        </div>
      </div>
    );
  }

  if (needsAuth) {
    return (
      <div className="section-shell py-12 fade-in">
        <div className="surface-card rounded-3xl p-10 text-center">
          <h1 className="section-title text-3xl font-semibold text-emerald-950">{t("signInTitle")}</h1>
          <p className="mt-3 text-sm text-emerald-800/70">
            {t("signInDesc")}
          </p>
          <Link
            href={`/login?next=/learn/${course.slug}`}
            className="mt-6 inline-flex rounded-full bg-emerald-700 px-6 py-2 text-sm font-semibold text-white"
          >
            {t("signIn")}
          </Link>
        </div>
      </div>
    );
  }

  if (!isEnrolled) {
    const imageUrl = resolveApiAsset(course.thumbnailUrl) || "/images/learning.jpg";
    return (
      <div className="section-shell py-12 fade-in">
        <div className="surface-card grid gap-8 rounded-3xl p-8 lg:grid-cols-[1.1fr,1fr]">
          <img src={imageUrl} alt={course.title} className="h-full w-full rounded-3xl object-cover" />
          <div className="space-y-4">
            <h1 className="section-title text-3xl font-semibold text-emerald-950">{course.title}</h1>
            <p className="text-sm text-emerald-800/70">{course.shortDescription}</p>
            <p className="text-sm text-emerald-900">
              {t("enrollDesc", { count: course.lessons.length })}
            </p>
            <Link
              href={`/courses/${course.slug}`}
              className="inline-flex rounded-full bg-emerald-700 px-6 py-2 text-sm font-semibold text-white"
            >
              {t("viewCourse")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeVideoUrl = isExerciseLesson
    ? ""
    : resolveApiAsset(currentLesson?.videoUrl || course.previewVideoUrl || "");
  const embedUrl = getEmbedUrl(activeVideoUrl);

  return (
    <div className="section-shell py-12 fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/dashboard" className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            {t("myLearning")}
          </Link>
          <h1 className="section-title text-3xl font-semibold text-emerald-950">{course.title}</h1>
          <p className="text-sm text-emerald-800/70">{t("resume")}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">{t("chooseLanguage")}</span>
          <button
            type="button"
            onClick={() => setLocale("vi")}
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${locale === "vi" ? "border-[color:var(--brand)] bg-[color:var(--brand-soft)] text-emerald-900" : "border-[color:var(--stroke)] text-emerald-800"}`}
          >
            VI
          </button>
          <button
            type="button"
            onClick={() => setLocale("en")}
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${locale === "en" ? "border-[color:var(--brand)] bg-[color:var(--brand-soft)] text-emerald-900" : "border-[color:var(--stroke)] text-emerald-800"}`}
          >
            EN
          </button>
        </div>
        <Link
          href={`/courses/${course.slug}`}
          className="rounded-full border border-[color:var(--stroke)] px-4 py-2 text-xs font-semibold text-emerald-900"
        >
          {t("courseDetails")}
        </Link>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[2.2fr,1fr]">
        <div className="space-y-6">
          <div className="surface-card overflow-hidden rounded-3xl">
            {isExerciseLesson ? (
              <div className="flex aspect-video items-center justify-center bg-[color:var(--brand-soft)] text-center">
                <div className="space-y-2 px-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{t("exerciseStep")}</p>
                  <p className="text-sm text-emerald-900">
                    {t("exerciseStepDesc")}
                  </p>
                </div>
              </div>
            ) : activeVideoUrl ? (
              embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={currentLesson?.title || course.title}
                  className="aspect-video w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={activeVideoUrl} controls className="aspect-video w-full" />
              )
            ) : (
              <div className="flex aspect-video items-center justify-center bg-emerald-950/10 text-sm text-emerald-800/70">
                {t("noVideo")}
              </div>
            )}
          </div>
          <div className="surface-card rounded-3xl p-6">
            <h2 className="section-title text-2xl font-semibold text-emerald-950">
              {currentLesson?.title || t("lessonLabel")}
            </h2>
            <p className="mt-2 text-sm text-emerald-800/70">
              {currentLesson
                ? t("estimate", { minutes: currentLesson.durationMinutes || 0 })
                : t("selectLesson")}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={async () => {
                  if (!course || !currentLesson) return;
                  if (isExerciseGateActive) return;
                  const token = localStorage.getItem("token");
                  if (!token) {
                    setNeedsAuth(true);
                    setIsEnrolled(false);
                    return;
                  }
                  await syncProgress(
                    {
                      courseId: course.id,
                      lessonId: currentLesson.id,
                      isCompleted: !isLessonCompleted,
                      setAsLast: true,
                    },
                    token
                  );
                }}
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  isLessonCompleted
                    ? "border border-[color:var(--stroke)] text-emerald-900"
                    : "bg-emerald-700 text-white"
                }`}
                disabled={!currentLesson || isSyncing || isExerciseGateActive}
              >
                {isExerciseGateActive
                  ? t("answerToComplete")
                  : isLessonCompleted
                    ? t("markIncomplete")
                    : t("markComplete")}
              </button>
              <button
                type="button"
                onClick={() => previousLesson && setSelectedLessonId(previousLesson.id)}
                disabled={!previousLesson}
                className="rounded-full border border-[color:var(--stroke)] px-4 py-2 text-xs font-semibold text-emerald-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t("previous")}
              </button>
              <button
                type="button"
                onClick={() => nextLesson && setSelectedLessonId(nextLesson.id)}
                disabled={!nextLesson || isExerciseGateActive}
                className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isExerciseGateActive ? t("nextLocked") : t("nextLesson")}
              </button>
              {nextLesson && (
                <span className="inline-flex items-center text-xs text-emerald-800/70">
                  {isExerciseGateActive
                    ? t("unlockNext")
                    : t("upNext", { title: nextLesson.title, type: (nextLesson.contentType ?? "video").toLowerCase() })}
                </span>
              )}
            </div>
            {isExerciseLesson && (
              currentExercise && exerciseReady ? (
                <div className="mt-6 rounded-2xl border border-[color:var(--stroke)] bg-white/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{t("lessonExercise")}</p>
                    {effectiveTimeLimitSeconds > 0 && (
                      <span className="rounded-full bg-[color:var(--brand-soft)] px-3 py-1 text-[11px] font-semibold text-emerald-800">
                        {formatSeconds(remainingSeconds ?? effectiveTimeLimitSeconds)}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-emerald-800/80">
                    {answeredCount}/{exerciseQuestions.length}
                  </p>
                  {effectiveMaxTabSwitches > 0 && (
                    <p className={`mt-1 text-xs ${tabSwitchCount > effectiveMaxTabSwitches ? "text-amber-700" : "text-emerald-800/80"}`}>
                      {t("tabWarn", { used: tabSwitchCount, max: effectiveMaxTabSwitches })}
                    </p>
                  )}
                  <div className="mt-4 space-y-4">
                    {exerciseQuestions.map((question, questionIndex) => {
                      const selectedOption = selectedExerciseOptions[question.id] ?? 0;
                      const options = [question.optionA, question.optionB, question.optionC, question.optionD];

                      return (
                        <div key={`${currentLesson?.id}-question-${question.id}`} className="rounded-xl border border-[color:var(--stroke)] bg-white p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                            {t("questionLabel", { index: questionIndex + 1 })}
                          </p>
                          <p className="mt-1 text-sm font-medium text-emerald-950">{question.question}</p>
                          <div className="mt-2 space-y-2">
                            {options.map((option, optionIndex) => {
                              const optionNumber = optionIndex + 1;
                              const isSelected = selectedOption === optionNumber;

                              return (
                                <button
                                  key={`${question.id}-option-${optionNumber}`}
                                  type="button"
                                  onClick={() => {
                                    setSelectedExerciseOptions((prev) => ({
                                      ...prev,
                                      [question.id]: optionNumber,
                                    }));
                                  }}
                                  className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2 text-left text-sm transition ${
                                    isSelected
                                      ? "border-[color:var(--brand)] bg-[color:var(--brand-soft)] text-emerald-900"
                                      : "border-[color:var(--stroke)] bg-white text-emerald-900 hover:border-[color:var(--stroke)]"
                                  }`}
                                >
                                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[color:var(--stroke)] text-[11px] font-semibold text-emerald-700">
                                    {String.fromCharCode(64 + optionNumber)}
                                  </span>
                                  <span>{option}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={answeredCount === 0 || isSubmittingExercise || isSyncing}
                      onClick={() => submitExercise("manual")}
                      className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isSubmittingExercise ? t("checking") : t("submit")}
                    </button>
                    {exerciseResult && (
                      <p
                        className={`text-xs font-semibold ${
                          exerciseResult.passed ? "text-emerald-700" : "text-amber-700"
                        }`}
                      >
                        {getResultMessage(exerciseResult)}
                      </p>
                    )}
                  </div>
                  {exerciseStatus && (
                    <div className="mt-3 rounded-xl bg-white px-3 py-2 text-xs text-emerald-900">
                      <p>{t("attempts", { count: exerciseStatus.attemptCount })}</p>
                      <p>{exerciseStatus.passed ? t("statusPassed") : t("statusPending")}</p>
                      <p>{t("bestScore", { score: exerciseStatus.bestScorePercent.toFixed(2) })}</p>
                      {exerciseStatus.lastAttemptedAt && (
                        <p>{t("lastAttempt", { time: new Date(exerciseStatus.lastAttemptedAt).toLocaleString() })}</p>
                      )}
                    </div>
                  )}
                  {exerciseResult && (
                    <div className="mt-3 rounded-xl bg-[color:var(--brand-soft)] px-3 py-2 text-xs text-emerald-900">
                      <p>{t("score", { score: exerciseResult.scorePercent.toFixed(2), correct: exerciseResult.correctAnswers, total: exerciseResult.totalQuestions })}</p>
                      <p>{t("passNeed", { percent: exerciseResult.passingPercent })}</p>
                      <p>{t("timeSpent", { spent: exerciseResult.timeSpentSeconds })}</p>
                      {exerciseResult.timedOut && <p className="font-semibold text-amber-700">{t("timedOut")}</p>}
                      {exerciseResult.tabViolation && <p className="font-semibold text-amber-700">{t("tabViolated")}</p>}
                      {exerciseResult.questionResults.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {exerciseResult.questionResults.map((item, index) => (
                            <div key={`${item.questionId}-${index}`} className="rounded-lg bg-white/80 px-3 py-2">
                              <p className="font-semibold text-emerald-950">{item.question}</p>
                              <p className="mt-1">
                                {t("yourAnswer")}:{" "}
                                {item.selectedOption > 0
                                  ? String.fromCharCode(64 + item.selectedOption)
                                  : t("noAnswer")}
                              </p>
                              <p>
                                {t("correctAnswer")}: {String.fromCharCode(64 + item.correctOption)}
                              </p>
                              {item.explanation && <p className="mt-1">{item.explanation}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm text-amber-800">
                  {t("notConfigured")}
                </div>
              )
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="surface-card rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-emerald-950">{t("yourProgress")}</h3>
            <p className="mt-1 text-xs text-emerald-800/70">
              {t("lessonsCompleted", { completed: completedLessons, total: totalLessons || course.lessons.length })}
            </p>
            <div className="mt-3 h-2 w-full rounded-full bg-[color:var(--brand-soft)]">
              <div
                className="h-2 rounded-full bg-emerald-600 transition-all"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-emerald-800/70">{t("completePercent", { percent: progressPercent.toFixed(1) })}</p>
          </div>
          <div className="surface-card rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-emerald-950">{t("lessons")}</h3>
            <p className="mt-1 text-xs text-emerald-800/70">{t("lessonCount", { count: course.lessons.length })}</p>
            <div className="mt-4 space-y-2">
              {course.lessons.map((lesson, index) => {
                const isActive = currentLesson?.id === lesson.id;
                const isCompleted = completedLessonIds.includes(lesson.id);
                const isLockedByExerciseGate = isExerciseGateActive && currentIndex >= 0 && index > currentIndex;
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => {
                      if (isLockedByExerciseGate) return;
                      setSelectedLessonId(lesson.id);
                    }}
                    disabled={isLockedByExerciseGate}
                    className={`flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left text-sm transition ${
                      isActive
                        ? "border-[color:var(--brand)] bg-[color:var(--brand-soft)] text-emerald-900"
                        : isLockedByExerciseGate
                          ? "border-transparent bg-white/70 text-emerald-800/50 opacity-60"
                          : "border-transparent bg-white/70 text-emerald-800/80 hover:border-[color:var(--stroke)]"
                    }`}
                  >
                    <span className="text-xs font-semibold text-emerald-700">{index + 1}</span>
                    <span className="flex-1">
                      <span className="block font-medium text-emerald-950">{lesson.title}</span>
                      <span className="text-xs text-emerald-800/70">
                        {lesson.durationMinutes} mins - {(lesson.contentType ?? "video").toLowerCase()}
                      </span>
                    </span>
                    {isCompleted && (
                      <span className="rounded-full bg-[color:var(--brand-soft)] px-2 py-1 text-[10px] font-semibold text-emerald-700">
                        {t("done")}
                      </span>
                    )}
                    {isLockedByExerciseGate && !isCompleted && (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-700">
                        {t("locked")}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="surface-card rounded-3xl p-6 text-sm text-emerald-800/70">
            {t("help")}
          </div>
        </aside>
      </div>
    </div>
  );
}



