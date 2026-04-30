"use client";

import CompareAddCard from "@/components/compare/CompareAddCard";
import CompareSelectedCard from "@/components/compare/CompareSelectedCard";
import type { Course } from "@/contexts/CartContext";

type Props = {
  selectedCourses: Course[];
  maxCompare: number;
  onRemove: (id: string) => void;
  onAddToCart: (course: Course) => void;
  onOpenPicker: () => void;
};

export default function CompareSelectedGrid({
  selectedCourses,
  maxCompare,
  onRemove,
  onAddToCart,
  onOpenPicker,
}: Props) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_auto]">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {selectedCourses.map((course) => (
          <CompareSelectedCard key={course.id} course={course} onRemove={onRemove} onAddToCart={onAddToCart} />
        ))}
        {selectedCourses.length < maxCompare ? <CompareAddCard remaining={maxCompare - selectedCourses.length} onOpenPicker={onOpenPicker} /> : null}
      </div>
    </div>
  );
}
