"use client";

import { Download } from "lucide-react";
import { toast } from "@/lib/notify";
import { useI18n } from "@/app/providers";
import type { LearningLesson } from "@/services/api";
import { iconForResource } from "@/components/learning/overviewUtils";

type Props = {
  lesson: LearningLesson;
};

export default function OverviewResources({ lesson }: Props) {
  const { tx } = useI18n();
  if (lesson.resources.length === 0) return null;

  const handleOpenResource = (resource: LearningLesson["resources"][number]) => {
    if (resource.url) {
      window.open(resource.url, "_blank", "noopener,noreferrer");
      return;
    }

    toast.info(tx(`Resource ${resource.title} does not have a URL yet.`, `Tài nguyên ${resource.title} chưa có URL.`));
  };

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Download className="size-4 text-purple-600" />
        <h3 className="text-sm font-semibold text-gray-900">{tx("Attached resources", "Tài nguyên đính kèm")}</h3>
      </div>
      <div className="space-y-2">
        {lesson.resources.map((resource) => (
          <button
            key={resource.id}
            onClick={() => handleOpenResource(resource)}
            className="group flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left transition hover:border-blue-300 hover:bg-blue-50"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 transition group-hover:bg-blue-100">
              {iconForResource(resource.type)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800">{resource.title}</p>
              <p className="text-xs uppercase text-gray-400">
                {resource.type}
                {resource.size ? ` · ${resource.size}` : ""}
              </p>
            </div>
            <Download className="size-4 shrink-0 text-gray-400 transition group-hover:text-blue-500" />
          </button>
        ))}
      </div>
    </div>
  );
}
