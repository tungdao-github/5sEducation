"use client";

import { Target } from "lucide-react";
import { useI18n } from "@/app/providers";
import type { LearningLesson } from "@/services/api";
import { getObjectives } from "@/components/learning/overviewUtils";

type Props = {
  lesson: LearningLesson;
};

export default function OverviewObjectives({ lesson }: Props) {
  const { tx } = useI18n();
  if (lesson.type !== "video") return null;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Target className="size-4 text-green-600" />
        <h3 className="text-sm font-semibold text-gray-900">{tx("What will you learn?", "Bạn sẽ học được gì?")}</h3>
      </div>
      <ul className="space-y-2 text-sm text-gray-600">
        {getObjectives(lesson).map((objective, index) => (
          <li key={`${lesson.id}-objective-${index}`} className="flex items-start gap-2">
            <span className="mt-0.5 text-green-500">+</span>
            <span>{objective}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
