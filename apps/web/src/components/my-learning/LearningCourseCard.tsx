"use client";

import { Award, CheckCircle, PlayCircle } from "lucide-react";
import { Link } from "@/lib/router";
import type { LearningCourse } from "@/components/my-learning/myLearningTypes";
import { useI18n } from "@/app/providers";

type Props = {
  course: LearningCourse;
  variant: "in-progress" | "completed" | "not-started";
};

const IMAGE_FALLBACK = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <rect width="100%" height="100%" fill="#0f172a"/>
    <circle cx="1000" cy="160" r="180" fill="rgba(255,255,255,0.08)"/>
    <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" fill="#cbd5e1" font-family="Arial, Helvetica, sans-serif" font-size="42">EduCourse</text>
  </svg>`
)}`;

const safeImage = (src?: string | null) => (src && src.trim().length > 0 ? src : IMAGE_FALLBACK);

export default function LearningCourseCard({ course, variant }: Props) {
  const { tx } = useI18n();

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
      <img src={safeImage(course.image)} alt={course.title} className="h-48 w-full object-cover" />
      <div className="p-5">
        <h3 className="mb-2 line-clamp-2 font-semibold text-slate-950">{course.title}</h3>
        <p className="mb-4 text-sm text-slate-500">{tx("Instructor", "Giảng viên")}: {course.instructor}</p>

        {variant === "in-progress" ? (
          <>
            <div className="mb-4">
              <div className="mb-2 flex justify-between text-sm text-slate-600">
                <span>{course.progress}% {tx("complete", "hoàn thành")}</span>
                <span>
                  {course.completedLessons}/{course.totalLessons} {tx("lessons", "bài")}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-slate-900 transition-all" style={{ width: `${course.progress}%` }} />
              </div>
            </div>
            <Link to={`/learn/${course.slug ?? course.id}`} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-2.5 text-white transition hover:bg-slate-700">
              <PlayCircle className="size-5" />
              Tiếp tục học
            </Link>
          </>
        ) : null}

        {variant === "completed" ? (
          <>
            <div className="mb-4 flex gap-2">
              <div className="flex-1 rounded-2xl bg-slate-100 px-4 py-3">
                <p className="text-xs text-slate-500">{tx("Completed", "Đã hoàn thành")}</p>
                <p className="text-lg font-semibold text-slate-950">{course.progress}%</p>
              </div>
              <div className="flex-1 rounded-2xl bg-emerald-50 px-4 py-3">
                <p className="text-xs text-emerald-700">{tx("Lessons", "Bài học")}</p>
                <p className="text-lg font-semibold text-emerald-700">
                  {course.completedLessons}/{course.totalLessons}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to={`/learn/${course.slug ?? course.id}`} className="flex-1 rounded-2xl bg-slate-100 py-2.5 text-center text-slate-700 transition hover:bg-slate-200">
                {tx("Review", "Xem lại")}
              </Link>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 py-2.5 text-white transition hover:bg-slate-700">
                <Award className="size-5" />
                {tx("Certificate", "Chứng chỉ")}
              </button>
            </div>
          </>
        ) : null}

        {variant === "not-started" ? (
          <Link to={`/learn/${course.slug ?? course.id}`} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-2.5 text-white transition hover:bg-slate-700">
            <PlayCircle className="size-5" />
            {tx("Start learning", "Bắt đầu học")}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
