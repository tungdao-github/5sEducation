import { type ElementType } from "react";
import { Info, MessageSquare, PenSquare, StickyNote } from "lucide-react";
import type { LearningLesson } from "@/services/api";

export type CourseLearnTabId = "overview" | "notes" | "qa" | "exercise";

export type CourseLearnTabItem = {
  id: CourseLearnTabId;
  label: string;
  Icon: ElementType;
  showFor?: LearningLesson["type"][];
};

type Translate = (en: string, vi: string, es?: string, fr?: string) => string;

export function buildCourseLearnTabs(tx: Translate): CourseLearnTabItem[] {
  return [
    { id: "overview", label: tx("Overview", "Tổng quan"), Icon: Info },
    { id: "notes", label: tx("Notes", "Ghi chú"), Icon: StickyNote },
    { id: "qa", label: tx("Q&A", "Hỏi & Đáp"), Icon: MessageSquare },
    { id: "exercise", label: tx("Exercise", "Bài tập"), Icon: PenSquare, showFor: ["quiz"] },
  ];
}
