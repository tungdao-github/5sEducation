"use client";

import type { CurriculumLesson, CurriculumSection } from "@/contexts/InstructorContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CourseCreatorSectionCard from "@/components/course-creator/CourseCreatorSectionCard";
import CourseCreatorCurriculumComposer from "@/components/course-creator/CourseCreatorCurriculumComposer";
import { useI18n } from "@/app/providers";

type Props = {
  sections: CurriculumSection[];
  currentSection: Partial<CurriculumSection> | null;
  setCurrentSection: (value: Partial<CurriculumSection> | null) => void;
  currentLesson: Partial<CurriculumLesson> | null;
  setCurrentLesson: (value: Partial<CurriculumLesson> | null) => void;
  onAddSection: () => void;
  onRemoveSection: (sectionId: string) => void;
  onAddLesson: (sectionId: string) => void;
  onRemoveLesson: (sectionId: string, lessonId: string) => void;
};

export default function CourseCreatorCurriculum({
  sections,
  currentSection,
  setCurrentSection,
  currentLesson,
  setCurrentLesson,
  onAddSection,
  onRemoveSection,
  onAddLesson,
  onRemoveLesson,
}: Props) {
  const { tx } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tx("Curriculum", "Chương trình học")}</CardTitle>
        <CardDescription>{tx("Course content structure", "Cấu trúc nội dung khóa học")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map((section) => (
          <CourseCreatorSectionCard
            key={section.id}
            section={section}
            onRemoveSection={onRemoveSection}
            onAddLesson={onAddLesson}
            onRemoveLesson={onRemoveLesson}
            currentLesson={currentLesson}
            setCurrentLesson={setCurrentLesson}
          />
        ))}

        <CourseCreatorCurriculumComposer
          currentSection={currentSection}
          setCurrentSection={setCurrentSection}
          onAddSection={onAddSection}
        />
      </CardContent>
    </Card>
  );
}
