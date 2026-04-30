"use client";

import type { ReactNode } from "react";

export type AccountTabId = "profile" | "orders" | "wishlist" | "password" | "addresses" | "loyalty";

type Tab = {
  id: AccountTabId;
  label: string;
  icon: ReactNode;
  badge?: number;
};

type Props = {
  tabs: Tab[];
  activeTab: AccountTabId;
  onSelect: (tab: AccountTabId) => void;
};

export default function AccountSidebar({ tabs, activeTab, onSelect }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelect(tab.id)}
          className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors border-l-2 ${
            activeTab === tab.id ? "bg-blue-50 text-blue-600 border-blue-600" : "text-gray-700 hover:bg-gray-50 border-transparent hover:border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3">
            {tab.icon}
            {tab.label}
          </div>
          {tab.badge !== undefined && tab.badge > 0 ? <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">{tab.badge}</span> : null}
        </button>
      ))}
    </div>
  );
}
