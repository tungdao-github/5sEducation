"use client";

import { createContext, useContext, useState, type ReactNode } from 'react';

export interface LessonNote {
  id: string;
  lessonId: string;
  courseId: string;
  content: string;
  timestamp: number;
  createdAt: string;
}

interface LearningContextType {
  getNotes: (courseId: string | number, lessonId: string | number) => LessonNote[];
  addNote: (courseId: string | number, lessonId: string | number, content: string, timestamp?: number) => void;
  deleteNote: (noteId: string) => void;
  updateNote: (noteId: string, content: string) => void;
}

const STORAGE_KEY = 'ec_learning_notes_v2';

function loadNotes() {
  if (typeof window === 'undefined') return [] as LessonNote[];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LessonNote[]) : [];
  } catch {
    return [] as LessonNote[];
  }
}

function saveNotes(notes: LessonNote[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // ignore storage write failures
  }
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export function LearningProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<LessonNote[]>(loadNotes);

  const persist = (updater: (current: LessonNote[]) => LessonNote[]) => {
    setNotes((current) => {
      const next = updater(current);
      saveNotes(next);
      return next;
    });
  };

  const getNotes = (courseId: string | number, lessonId: string | number) =>
    notes
      .filter((note) => note.courseId === String(courseId) && note.lessonId === String(lessonId))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const addNote = (courseId: string | number, lessonId: string | number, content: string, timestamp = 0) => {
    persist((current) => [
      ...current,
      {
        id: `note_${Date.now()}`,
        courseId: String(courseId),
        lessonId: String(lessonId),
        content,
        timestamp,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const deleteNote = (noteId: string) => {
    persist((current) => current.filter((note) => note.id !== noteId));
  };

  const updateNote = (noteId: string, content: string) => {
    persist((current) => current.map((note) => (note.id === noteId ? { ...note, content } : note)));
  };

  return (
    <LearningContext.Provider value={{ getNotes, addNote, deleteNote, updateNote }}>
      {children}
    </LearningContext.Provider>
  );
}

export function useLearning() {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within LearningProvider');
  }
  return context;
}

