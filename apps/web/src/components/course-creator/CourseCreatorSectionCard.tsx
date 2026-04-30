"use client";

import { Plus, X } from "lucide-react";
import type { CurriculumLesson, CurriculumSection } from "@/contexts/InstructorContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/app/providers";

type Props = {
  section: CurriculumSection;
  onRemoveSection: (sectionId: string) => void;
  onAddLesson: (sectionId: string) => void;
  onRemoveLesson: (sectionId: string, lessonId: string) => void;
  currentLesson: Partial<CurriculumLesson> | null;
  setCurrentLesson: (value: Partial<CurriculumLesson> | null) => void;
};

export default function CourseCreatorSectionCard({ section, onRemoveSection, onAddLesson, onRemoveLesson, currentLesson, setCurrentLesson }: Props) {
  const { tx } = useI18n();

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-semibold">{section.title}</h4>
          <p className="text-sm text-gray-600">
            {section.lessons.length} {tx("lessons", "bài học")} • {section.duration}
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => onRemoveSection(section.id)}>
          <X className="size-4" />
        </Button>
      </div>

      <div className="ml-4 space-y-2">
        {section.lessons.map((lesson) => (
          <div key={lesson.id} className="flex items-center justify-between rounded bg-gray-50 p-2">
            <div className="flex items-center gap-2 text-sm">
              <span>{lesson.type === "video" ? "▶" : lesson.type === "document" ? "📄" : "❓"}</span>
              <span>{lesson.title}</span>
              <span className="text-gray-500">• {lesson.duration}</span>
              {lesson.free ? <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">{tx("Free", "Miễn phí")}</span> : null}
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => onRemoveLesson(section.id, lesson.id)}>
              <X className="size-3" />
            </Button>
          </div>
        ))}

        <div className="mt-2 flex gap-2">
          <Input placeholder={tx("Lesson title", "Tiêu đề bài học")} value={currentLesson?.title || ""} onChange={(e) => setCurrentLesson({ ...currentLesson, title: e.target.value })} />
          <Input placeholder={tx("Duration", "Thời lượng")} className="w-24" value={currentLesson?.duration || ""} onChange={(e) => setCurrentLesson({ ...currentLesson, duration: e.target.value })} />
          <Button type="button" size="sm" onClick={() => onAddLesson(section.id)}>
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
