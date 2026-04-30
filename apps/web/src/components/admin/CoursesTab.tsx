"use client";

import { useMemo, useState } from "react";
import type { CourseManageDto } from "@/services/api";
import {
  CoursesEmptyState,
  CoursesList,
  CoursesSearchBar,
  CoursesSummaryCards,
} from "@/components/admin/CoursesTabParts";

type CoursesTabProps = {
  courses: CourseManageDto[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onDelete: (course: CourseManageDto) => Promise<void>;
};

export default function CoursesTab({ courses, searchQuery, setSearchQuery, onDelete }: CoursesTabProps) {
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);

  const visible = useMemo(
    () =>
      courses.filter((course) =>
        `${course.title} ${course.category?.title ?? ""} ${course.language} ${course.level}`.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [courses, searchQuery]
  );

  return (
    <div>
      <CoursesSearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <CoursesSummaryCards courses={courses} />
      {visible.length > 0 ? (
        <CoursesList courses={visible} expandedCourse={expandedCourse} setExpandedCourse={setExpandedCourse} onDelete={onDelete} />
      ) : (
        <CoursesEmptyState />
      )}
    </div>
  );
}
