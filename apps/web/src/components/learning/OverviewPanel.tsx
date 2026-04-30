"use client";

import type { LearningLesson } from "@/services/api";
import OverviewHeader from "@/components/learning/OverviewHeader";
import OverviewObjectives from "@/components/learning/OverviewObjectives";
import OverviewResources from "@/components/learning/OverviewResources";
import OverviewQuizInfo from "@/components/learning/OverviewQuizInfo";

interface Props {
  lesson: LearningLesson;
}

export default function OverviewPanel({ lesson }: Props) {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <OverviewHeader lesson={lesson} />
        <OverviewObjectives lesson={lesson} />
        <OverviewResources lesson={lesson} />
        <OverviewQuizInfo lesson={lesson} />
      </div>
    </div>
  );
}
