"use client";

import { useI18n } from "@/app/providers";
import { Link } from "@/lib/router";
import type { ReactNode } from "react";

type TabItem = {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: number;
};

type Props = {
  tabs: TabItem[];
  activeTab: string;
  routes: Record<string, string>;
};

export default function AdminDashboardSidebar({ tabs, activeTab, routes }: Props) {
  const { tx } = useI18n();

  return (
    <aside className="hidden w-56 shrink-0 lg:flex">
      <div className="sticky top-6 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="p-3">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">{tx("Management", "Quản lý")}</p>
          <nav className="space-y-0.5">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                to={routes[tab.id]}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  activeTab === tab.id ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {tab.icon}
                  {tab.label}
                </div>
                {tab.badge !== undefined ? (
                  <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                    {tab.badge}
                  </span>
                ) : null}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
}
