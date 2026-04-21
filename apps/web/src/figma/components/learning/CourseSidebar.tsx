"use client";

import { useEffect, useState } from 'react';
import { CheckCircle, ChevronDown, ChevronRight, PlayCircle, PenSquare } from 'lucide-react';
import { type LearningLesson, type LearningSection } from '../../data/api';

interface Props {
  sections: LearningSection[];
  currentLessonId: string;
  completedIds: number[];
  onSelectLesson: (lesson: LearningLesson) => void;
  courseTitle: string;
  completionPercent: number;
}

export default function CourseSidebar({ sections, currentLessonId, completedIds, onSelectLesson, courseTitle, completionPercent }: Props) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const section = sections.find((item) => item.lessons.some((lesson) => lesson.id === currentLessonId));
    if (section) {
      setOpenSections((prev) => new Set([...prev, section.id]));
    }
  }, [sections, currentLessonId]);

  const totalLessons = sections.reduce((sum, section) => sum + section.lessons.length, 0);
  const completedCount = completedIds.length;

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col bg-gray-900 text-white">
      <div className="border-b border-gray-700 p-4">
        <h2 className="mb-3 line-clamp-2 text-sm font-semibold text-gray-100">{courseTitle}</h2>
        <div className="mb-1.5 flex items-center justify-between text-xs text-gray-400">
          <span>{completedCount}/{totalLessons} bai hoc</span>
          <span>{Math.round(completionPercent)}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-700">
          <div className="h-1.5 rounded-full bg-blue-500 transition-all" style={{ width: `${completionPercent}%` }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sections.map((section, index) => {
          const isOpen = openSections.has(section.id);
          const sectionCompleted = section.lessons.filter((lesson) => completedIds.includes(lesson.numericId)).length;
          return (
            <div key={section.id} className="border-b border-gray-800">
              <button className="flex w-full items-start gap-2 p-4 text-left transition hover:bg-gray-800" onClick={() => toggleSection(section.id)}>
                <div className="mt-0.5">{isOpen ? <ChevronDown className="size-4 text-gray-400" /> : <ChevronRight className="size-4 text-gray-400" />}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-100">Phan {index + 1}: {section.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{sectionCompleted}/{section.lessons.length} · {section.duration}</p>
                </div>
              </button>

              {isOpen && (
                <div>
                  {section.lessons.map((lesson) => {
                    const active = lesson.id === currentLessonId;
                    const completed = completedIds.includes(lesson.numericId);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => onSelectLesson(lesson)}
                        className={`flex w-full items-start gap-3 border-l-2 px-4 py-3 text-left transition ${active ? 'border-blue-500 bg-blue-600/20' : 'border-transparent hover:bg-gray-800'}`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {completed ? <CheckCircle className="size-4 text-green-500" /> : lesson.type === 'quiz' ? <PenSquare className="size-4 text-orange-400" /> : <PlayCircle className="size-4 text-blue-400" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`line-clamp-2 text-xs ${active ? 'font-medium text-blue-300' : 'text-gray-300'}`}>{lesson.title}</p>
                          <p className="mt-0.5 text-xs text-gray-500">{lesson.type === 'quiz' ? 'Quiz' : 'Video'} · {lesson.duration}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

