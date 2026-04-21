import { useState } from 'react';
import { CheckCircle, PlayCircle, FileText, PenSquare, ChevronDown, ChevronRight, Lock } from 'lucide-react';
import { CourseSection, CourseLessonItem } from '../../data/lessons';

interface Props {
  sections: CourseSection[];
  currentLessonId: string;
  completedIds: string[];
  onSelectLesson: (lesson: CourseLessonItem) => void;
  courseTitle: string;
  completionPercent: number;
}

function LessonTypeIcon({ type }: { type: CourseLessonItem['type'] }) {
  if (type === 'quiz') return <PenSquare className="size-3.5 text-orange-400 shrink-0" />;
  if (type === 'reading') return <FileText className="size-3.5 text-green-400 shrink-0" />;
  return <PlayCircle className="size-3.5 text-blue-400 shrink-0" />;
}

export default function CourseSidebar({
  sections,
  currentLessonId,
  completedIds,
  onSelectLesson,
  courseTitle,
  completionPercent,
}: Props) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    // Auto-open section containing current lesson
    new Set(sections.filter(s => s.lessons.some(l => l.id === currentLessonId)).map(s => s.id))
  );

  const toggleSection = (id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalLessons = sections.reduce((s, sec) => s + sec.lessons.length, 0);
  const completedCount = completedIds.length;

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 shrink-0">
        <h2 className="text-sm font-semibold line-clamp-2 text-gray-100 leading-snug mb-3">
          {courseTitle}
        </h2>
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
          <span>{completedCount}/{totalLessons} bài học</span>
          <span>{completionPercent}% hoàn thành</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {sections.map((section, sIdx) => {
          const isOpen = openSections.has(section.id);
          const sectionCompleted = section.lessons.filter(l => completedIds.includes(l.id)).length;
          const sectionTotal = section.lessons.length;

          return (
            <div key={section.id} className="border-b border-gray-800">
              {/* Section header */}
              <button
                className="w-full flex items-start gap-2 p-4 text-left hover:bg-gray-800 transition"
                onClick={() => toggleSection(section.id)}
              >
                <div className="mt-0.5">
                  {isOpen
                    ? <ChevronDown className="size-4 text-gray-400" />
                    : <ChevronRight className="size-4 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-100 leading-snug">
                    Chương {sIdx + 1}: {section.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {sectionCompleted}/{sectionTotal} · {section.lessons.reduce((acc, l) => {
                      if (l.type !== 'video') return acc;
                      const [m, s] = l.duration.split(':').map(Number);
                      return acc + m * 60 + (s ?? 0);
                    }, 0) > 0
                      ? `${Math.ceil(section.lessons.filter(l => l.type === 'video').reduce((acc, l) => {
                          const [m] = l.duration.split(':').map(Number);
                          return acc + m;
                        }, 0))} phút`
                      : 'Bài kiểm tra'}
                  </p>
                </div>
                {sectionCompleted === sectionTotal && (
                  <CheckCircle className="size-4 text-green-500 shrink-0 mt-0.5" />
                )}
              </button>

              {/* Lessons */}
              {isOpen && (
                <div>
                  {section.lessons.map((lesson) => {
                    const isActive = lesson.id === currentLessonId;
                    const isDone = completedIds.includes(lesson.id);
                    const isLocked = !lesson.isPreview && false; // all unlocked in demo

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => !isLocked && onSelectLesson(lesson)}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition group
                          ${isActive
                            ? 'bg-blue-600/20 border-l-2 border-blue-500'
                            : 'hover:bg-gray-800 border-l-2 border-transparent'}
                          ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {/* Status icon */}
                        <div className="mt-0.5 shrink-0">
                          {isLocked ? (
                            <Lock className="size-3.5 text-gray-500" />
                          ) : isDone ? (
                            <CheckCircle className="size-3.5 text-green-500" />
                          ) : (
                            <LessonTypeIcon type={lesson.type} />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs leading-snug line-clamp-2
                            ${isActive ? 'text-blue-300 font-medium' : isDone ? 'text-gray-400' : 'text-gray-300 group-hover:text-white'}`}>
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-500">
                              {lesson.type === 'video' ? '▶' : lesson.type === 'quiz' ? '📝' : '📖'}&nbsp;
                              {lesson.duration}
                            </span>
                            {lesson.isPreview && !isDone && (
                              <span className="text-xs text-blue-400 bg-blue-900/40 px-1.5 py-0.5 rounded">
                                Xem thử
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Active indicator */}
                        {isActive && (
                          <div className="size-2 rounded-full bg-blue-400 shrink-0 mt-1.5 animate-pulse" />
                        )}
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
