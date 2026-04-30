"use client";

import type { ReactNode } from "react";
import { Clock, Award, TrendingUp } from "lucide-react";
import type { LearningCourse } from "@/components/my-learning/myLearningTypes";
import LearningCourseCard from "@/components/my-learning/LearningCourseCard";
import { useI18n } from "@/app/providers";

type Props = {
  inProgressCourses: LearningCourse[];
  completedCourses: LearningCourse[];
  notStartedCourses: LearningCourse[];
};

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="mb-6 flex items-center gap-2">
      {icon}
      <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
    </div>
  );
}

export default function MyLearningCoursesSection({
  inProgressCourses,
  completedCourses,
  notStartedCourses,
}: Props) {
  const { tx } = useI18n();

  return (
    <div className="space-y-10">
      {inProgressCourses.length > 0 ? (
        <section>
          <SectionTitle icon={<TrendingUp className="size-6 text-blue-600" />} title={tx(`In progress (${inProgressCourses.length})`, `Đang học (${inProgressCourses.length})`)} />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {inProgressCourses.map((course) => (
              <LearningCourseCard key={course.id} course={course} variant="in-progress" />
            ))}
          </div>
        </section>
      ) : null}

      {completedCourses.length > 0 ? (
        <section>
          <SectionTitle icon={<Award className="size-6 text-green-600" />} title={tx(`Completed (${completedCourses.length})`, `Đã hoàn thành (${completedCourses.length})`)} />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {completedCourses.map((course) => (
              <LearningCourseCard key={course.id} course={course} variant="completed" />
            ))}
          </div>
        </section>
      ) : null}

      {notStartedCourses.length > 0 ? (
        <section>
          <SectionTitle icon={<Clock className="size-6 text-slate-600" />} title={tx(`Not started (${notStartedCourses.length})`, `Chưa bắt đầu (${notStartedCourses.length})`)} />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {notStartedCourses.map((course) => (
              <LearningCourseCard key={course.id} course={course} variant="not-started" />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
