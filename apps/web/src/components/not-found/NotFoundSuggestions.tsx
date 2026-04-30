"use client";

import { BookOpen } from "lucide-react";
import { useNavigate } from "@/lib/router";

type Props = {
  items: { id: string; title: string; icon: string }[];
};

export default function NotFoundSuggestions({ items }: Props) {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
      <div className="mb-6 flex items-center justify-center gap-2">
        <BookOpen className="size-6 text-indigo-600" />
        <h3 className="text-xl font-bold text-gray-900">Có thể bạn quan tâm</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {items.map((course) => (
          <button
            key={course.id}
            onClick={() => navigate(`/course/${course.id}`)}
            className="group rounded-xl border-2 border-gray-200 p-4 transition-all hover:border-indigo-600 hover:bg-indigo-50"
          >
            <div className="mb-2 text-4xl">{course.icon}</div>
            <h4 className="font-semibold text-gray-900 transition-colors group-hover:text-indigo-600">{course.title}</h4>
          </button>
        ))}
      </div>
    </div>
  );
}
