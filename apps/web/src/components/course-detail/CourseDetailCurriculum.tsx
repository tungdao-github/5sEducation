"use client";

import { ChevronDown, PlayCircle } from "lucide-react";
import { formatDuration } from "@/services/api";

type CurriculumSection = {
  title: string;
  lessons: number;
  duration: string;
  items?: Array<{ title: string; durationMinutes?: number | null }>;
};

type Props = {
  sections: CurriculumSection[];
  totalLessons: number;
  expandedSections: number[];
  onToggleSection: (index: number) => void;
};

export default function CourseDetailCurriculum({ sections, totalLessons, expandedSections, onToggleSection }: Props) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-950">Chương trình giảng dạy</h2>
        <div className="text-sm text-slate-500">
          {sections.length} phần • {totalLessons} bài học
        </div>
      </div>

      <div className="space-y-3">
        {sections.map((section, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-slate-200">
            <button onClick={() => onToggleSection(index)} className="flex w-full items-center justify-between p-4 transition-colors hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <ChevronDown className={`size-5 text-slate-500 transition-transform ${expandedSections.includes(index) ? "rotate-180" : ""}`} />
                <div className="text-left">
                  <div className="font-semibold text-slate-950">{section.title}</div>
                  <div className="text-sm text-slate-500">
                    {section.lessons} bài học • {section.duration}
                  </div>
                </div>
              </div>
            </button>

            {expandedSections.includes(index) ? (
              <div className="bg-slate-50 px-4 pb-4">
                <div className="space-y-2 pt-2">
                  {section.items && section.items.length > 0 ? (
                    section.items.map((lesson, lessonIndex) => (
                      <div key={`${lesson.title}-${lessonIndex}`} className="flex items-center gap-2 py-2 text-sm text-slate-600">
                        <PlayCircle className="size-4" />
                        <span className="flex-1">{lesson.title}</span>
                        {lesson.durationMinutes ? <span className="text-xs text-slate-400">{formatDuration(lesson.durationMinutes)}</span> : null}
                      </div>
                    ))
                  ) : (
                    Array.from({ length: section.lessons }).map((_, lessonIndex) => (
                      <div key={lessonIndex} className="flex items-center gap-2 py-2 text-sm text-slate-600">
                        <PlayCircle className="size-4" />
                        <span>Bài {lessonIndex + 1}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
