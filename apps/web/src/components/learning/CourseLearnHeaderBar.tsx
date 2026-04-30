"use client";

import { Award, ChevronLeft, Menu, X } from "lucide-react";
import { Link } from "@/lib/router";
import { useI18n } from "@/app/providers";

type Props = {
  title: string;
  completionPercent: number;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export default function CourseLearnHeaderBar({ title, completionPercent, sidebarOpen, onToggleSidebar }: Props) {
  const { tx } = useI18n();

  return (
    <header className="z-20 flex h-14 shrink-0 items-center gap-3 border-b border-gray-800 bg-gray-900 px-4">
      <Link to="/my-learning" className="flex shrink-0 items-center gap-1.5 text-sm text-gray-400 transition hover:text-white">
        <ChevronLeft className="size-4" />
        <span className="hidden sm:inline">EduCourse</span>
      </Link>
      <div className="h-5 w-px shrink-0 bg-gray-700" />
      <h1 className="flex-1 truncate text-sm font-medium text-gray-200">{title}</h1>
      <div className="hidden items-center gap-3 md:flex">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 rounded-full bg-gray-700">
            <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${completionPercent}%` }} />
          </div>
          <span className="text-xs text-gray-400">
            {Math.round(completionPercent)}% <span className="hidden text-gray-600 lg:inline">{tx("complete", "hoàn thành")}</span>
          </span>
        </div>
      </div>
      {Math.round(completionPercent) === 100 ? (
        <button className="hidden items-center gap-1.5 rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-bold text-gray-900 transition hover:bg-yellow-400 sm:flex">
          <Award className="size-3.5" /> {tx("Certificate", "Chứng chỉ")}
        </button>
      ) : null}
      <button
        onClick={onToggleSidebar}
        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
        title={sidebarOpen ? tx("Close course content", "Đóng nội dung khóa học") : tx("Open course content", "Mở nội dung khóa học")}
      >
        {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
    </header>
  );
}
