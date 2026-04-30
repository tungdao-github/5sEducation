"use client";

import CourseCard from "@/components/CourseCard";
import type { Course } from "@/contexts/CartContext";

type Props = {
  courses: Course[];
};

export default function SearchResultsGrid({ courses }: Props) {
  return (
    <div className="mb-8 grid w-full grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-5 justify-items-stretch">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
