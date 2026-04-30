"use client";

import { BookOpen } from "lucide-react";
import { useI18n } from "@/app/providers";
import { Link } from "@/lib/router";

type Props = {
  message: string;
};

export default function CourseLearnErrorState({ message }: Props) {
  const { tx } = useI18n();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
      <div className="text-center">
        <BookOpen className="mx-auto mb-4 size-16 opacity-50" />
        <h2 className="mb-4 text-xl">{message}</h2>
        <Link to="/my-learning" className="text-blue-400 hover:underline">
          {tx("← Back to my learning", "← Về trang học của tôi")}
        </Link>
      </div>
    </div>
  );
}
