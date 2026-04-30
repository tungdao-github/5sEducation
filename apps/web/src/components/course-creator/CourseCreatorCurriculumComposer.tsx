"use client";

import { Plus } from "lucide-react";
import type { CurriculumSection } from "@/contexts/InstructorContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/app/providers";

type Props = {
  currentSection: Partial<CurriculumSection> | null;
  setCurrentSection: (value: Partial<CurriculumSection> | null) => void;
  onAddSection: () => void;
};

export default function CourseCreatorCurriculumComposer({ currentSection, setCurrentSection, onAddSection }: Props) {
  const { tx } = useI18n();

  return (
    <div className="space-y-3 rounded-lg border-2 border-dashed p-4">
      <h4 className="font-medium">{tx("Add new section", "Thêm chương mới")}</h4>
      <div className="flex gap-2">
        <Input placeholder={tx("Section title", "Tiêu đề chương")} value={currentSection?.title || ""} onChange={(e) => setCurrentSection({ ...currentSection, title: e.target.value })} />
        <Input placeholder={tx("Duration", "Thời lượng")} className="w-32" value={currentSection?.duration || ""} onChange={(e) => setCurrentSection({ ...currentSection, duration: e.target.value })} />
        <Button type="button" onClick={onAddSection}>
          <Plus className="mr-2 size-4" />
          {tx("Add", "Thêm")}
        </Button>
      </div>
    </div>
  );
}
