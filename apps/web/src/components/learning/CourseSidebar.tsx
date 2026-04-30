"use client";

import { useEffect, useState } from "react";
import type { LearningLesson, LearningSection } from "@/services/api";
import CourseSidebarHeader from "@/components/learning/CourseSidebarHeader";
import CourseSidebarSection from "@/components/learning/CourseSidebarSection";

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
      <CourseSidebarHeader courseTitle={courseTitle} completedCount={completedCount} totalLessons={totalLessons} completionPercent={completionPercent} />

      <div className="flex-1 overflow-y-auto">
        {sections.map((section, index) => (
          <CourseSidebarSection
            key={section.id}
            section={section}
            index={index}
            isOpen={openSections.has(section.id)}
            completedIds={completedIds}
            currentLessonId={currentLessonId}
            onToggle={toggleSection}
            onSelectLesson={onSelectLesson}
          />
        ))}
      </div>
    </div>
  );
}
