import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CourseLessonItem } from '../data/lessons';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LessonNote {
  id: string;
  lessonId: string;
  courseId: string;
  content: string;
  timestamp: number; // simulated video time in seconds
  createdAt: string;
}

export interface QuizAttempt {
  exerciseId: string;
  courseId: string;
  lessonId: string;
  answers: Record<string, string | string[]>;
  score: number;         // 0–100
  passed: boolean;
  completedAt: string;
}

export interface CourseProgress {
  courseId: string;
  completedLessonIds: string[];
  currentLessonId: string | null;
  lastAccessedAt: string;
  totalSeconds: number;  // total watch time
}

interface LearningContextType {
  // Progress
  getProgress(courseId: string): CourseProgress;
  markLessonComplete(courseId: string, lesson: CourseLessonItem): void;
  markLessonIncomplete(courseId: string, lessonId: string): void;
  setCurrentLesson(courseId: string, lessonId: string): void;
  isLessonCompleted(courseId: string, lessonId: string): boolean;
  getCompletionPercent(courseId: string, totalLessons: number): number;

  // Notes
  getNotes(courseId: string, lessonId: string): LessonNote[];
  addNote(courseId: string, lessonId: string, content: string, timestamp?: number): void;
  deleteNote(noteId: string): void;
  updateNote(noteId: string, content: string): void;

  // Quiz attempts
  getAttempt(courseId: string, exerciseId: string): QuizAttempt | null;
  saveAttempt(attempt: QuizAttempt): void;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

const STORAGE_KEY = 'ec_learning_v1';

interface StorageData {
  progress: Record<string, CourseProgress>;
  notes: LessonNote[];
  attempts: QuizAttempt[];
}

function load(): StorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { progress: {}, notes: [], attempts: [] };
}

function save(data: StorageData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export function LearningProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StorageData>(load);

  const persist = useCallback((updater: (prev: StorageData) => StorageData) => {
    setData(prev => {
      const next = updater(prev);
      save(next);
      return next;
    });
  }, []);

  // ── Progress ──

  const getProgress = useCallback((courseId: string): CourseProgress => {
    return data.progress[courseId] ?? {
      courseId,
      completedLessonIds: [],
      currentLessonId: null,
      lastAccessedAt: new Date().toISOString(),
      totalSeconds: 0,
    };
  }, [data.progress]);

  const markLessonComplete = useCallback((courseId: string, lesson: CourseLessonItem) => {
    persist(prev => {
      const p = prev.progress[courseId] ?? {
        courseId,
        completedLessonIds: [],
        currentLessonId: null,
        lastAccessedAt: new Date().toISOString(),
        totalSeconds: 0,
      };
      if (p.completedLessonIds.includes(lesson.id)) return prev;
      return {
        ...prev,
        progress: {
          ...prev.progress,
          [courseId]: {
            ...p,
            completedLessonIds: [...p.completedLessonIds, lesson.id],
            lastAccessedAt: new Date().toISOString(),
          },
        },
      };
    });
  }, [persist]);

  const markLessonIncomplete = useCallback((courseId: string, lessonId: string) => {
    persist(prev => {
      const p = prev.progress[courseId];
      if (!p) return prev;
      return {
        ...prev,
        progress: {
          ...prev.progress,
          [courseId]: {
            ...p,
            completedLessonIds: p.completedLessonIds.filter(id => id !== lessonId),
          },
        },
      };
    });
  }, [persist]);

  const setCurrentLesson = useCallback((courseId: string, lessonId: string) => {
    persist(prev => {
      const p = prev.progress[courseId] ?? {
        courseId,
        completedLessonIds: [],
        currentLessonId: null,
        lastAccessedAt: new Date().toISOString(),
        totalSeconds: 0,
      };
      return {
        ...prev,
        progress: {
          ...prev.progress,
          [courseId]: {
            ...p,
            currentLessonId: lessonId,
            lastAccessedAt: new Date().toISOString(),
          },
        },
      };
    });
  }, [persist]);

  const isLessonCompleted = useCallback((courseId: string, lessonId: string): boolean => {
    return data.progress[courseId]?.completedLessonIds.includes(lessonId) ?? false;
  }, [data.progress]);

  const getCompletionPercent = useCallback((courseId: string, totalLessons: number): number => {
    if (totalLessons === 0) return 0;
    const completed = data.progress[courseId]?.completedLessonIds.length ?? 0;
    return Math.round((completed / totalLessons) * 100);
  }, [data.progress]);

  // ── Notes ──

  const getNotes = useCallback((courseId: string, lessonId: string): LessonNote[] => {
    return data.notes
      .filter(n => n.courseId === courseId && n.lessonId === lessonId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [data.notes]);

  const addNote = useCallback((courseId: string, lessonId: string, content: string, timestamp = 0) => {
    const note: LessonNote = {
      id: `note_${Date.now()}`,
      lessonId,
      courseId,
      content,
      timestamp,
      createdAt: new Date().toISOString(),
    };
    persist(prev => ({ ...prev, notes: [...prev.notes, note] }));
  }, [persist]);

  const deleteNote = useCallback((noteId: string) => {
    persist(prev => ({ ...prev, notes: prev.notes.filter(n => n.id !== noteId) }));
  }, [persist]);

  const updateNote = useCallback((noteId: string, content: string) => {
    persist(prev => ({
      ...prev,
      notes: prev.notes.map(n => n.id === noteId ? { ...n, content } : n),
    }));
  }, [persist]);

  // ── Quiz attempts ──

  const getAttempt = useCallback((courseId: string, exerciseId: string): QuizAttempt | null => {
    return data.attempts.find(a => a.courseId === courseId && a.exerciseId === exerciseId) ?? null;
  }, [data.attempts]);

  const saveAttempt = useCallback((attempt: QuizAttempt) => {
    persist(prev => ({
      ...prev,
      attempts: [
        ...prev.attempts.filter(a => !(a.courseId === attempt.courseId && a.exerciseId === attempt.exerciseId)),
        attempt,
      ],
    }));
  }, [persist]);

  return (
    <LearningContext.Provider value={{
      getProgress, markLessonComplete, markLessonIncomplete,
      setCurrentLesson, isLessonCompleted, getCompletionPercent,
      getNotes, addNote, deleteNote, updateNote,
      getAttempt, saveAttempt,
    }}>
      {children}
    </LearningContext.Provider>
  );
}

export function useLearning() {
  const ctx = useContext(LearningContext);
  if (!ctx) throw new Error('useLearning must be used within LearningProvider');
  return ctx;
}
