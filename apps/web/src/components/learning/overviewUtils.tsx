"use client";

import { BookOpen, Download, FileText, Link2 } from "lucide-react";
import type { LearningLesson } from "@/services/api";

export function iconForResource(type: LearningLesson["resources"][number]["type"]) {
  if (type === "pdf") return <FileText className="size-4 text-red-500" />;
  if (type === "link") return <Link2 className="size-4 text-blue-500" />;
  if (type === "zip") return <Download className="size-4 text-gray-500" />;
  return <BookOpen className="size-4 text-purple-500" />;
}

export function getObjectives(lesson: LearningLesson) {
  const sentences = (lesson.description || "")
    .split(/[.!?]/)
    .map((value) => value.trim())
    .filter((value) => value.length > 20)
    .slice(0, 3);

  if (sentences.length > 0) {
    return sentences.map((value) => value.charAt(0).toUpperCase() + value.slice(1));
  }

  return [
    "Hieu cac khai niem cot loi trong bai hoc.",
    "Ap dung kien thuc vao quy trinh hoc tap thuc te.",
    "Ket hop ghi chu, tai nguyen va quiz de cung co noi dung.",
  ];
}
