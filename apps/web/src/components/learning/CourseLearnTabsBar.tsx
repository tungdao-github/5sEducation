"use client";

import { type ElementType } from "react";
import { PenSquare } from "lucide-react";
import { useI18n } from "@/app/providers";
import type { LearningLesson } from "@/services/api";

export type CourseLearnTabId = "overview" | "notes" | "qa" | "exercise";

type TabItem = {
  id: CourseLearnTabId;
  label: string;
  Icon: ElementType;
  showFor?: LearningLesson["type"][];
};

type Props = {
  tabs: TabItem[];
  activeTab: CourseLearnTabId;
  lesson: LearningLesson;
  onSelect: (tab: CourseLearnTabId) => void;
};

export default function CourseLearnTabsBar({ tabs, activeTab, lesson, onSelect }: Props) {
  const { tx } = useI18n();
  const visibleTabs = tabs.filter((tab) => !tab.showFor || tab.showFor.includes(lesson.type));

  return (
    <div className="sticky top-0 z-20 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex overflow-x-auto">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-medium transition ${
              activeTab === tab.id ? "border-blue-600 bg-blue-50/50 text-blue-600" : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <tab.Icon className="size-4" />
            <span>{tab.label}</span>
          </button>
        ))}
        {lesson.type === "quiz" && lesson.exercise && !visibleTabs.find((tab) => tab.id === "exercise") ? (
          <button
            onClick={() => onSelect("exercise")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-medium transition ${
              activeTab === "exercise" ? "border-orange-500 bg-orange-50/50 text-orange-600" : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <PenSquare className="size-4" />
            <span>{tx("Exercise", "Bài tập")}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
