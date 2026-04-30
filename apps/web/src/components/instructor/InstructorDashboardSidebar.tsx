"use client";

import { type ElementType } from "react";
import { Award, BookOpen, TrendingUp } from "lucide-react";

type TabId = "overview" | "courses" | "revenue";

type Props = {
  activeTab: TabId;
  onSelect: (tab: TabId) => void;
};

export default function InstructorDashboardSidebar({ activeTab, onSelect }: Props) {
  const items: { id: TabId; label: string; icon: ElementType }[] = [
    { id: "overview", label: "Tổng quan", icon: Award },
    { id: "courses", label: "Khóa học của tôi", icon: BookOpen },
    { id: "revenue", label: "Doanh thu", icon: TrendingUp },
  ];

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Quản lý</p>
      </div>
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                active ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className="size-4" />
              {item.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
