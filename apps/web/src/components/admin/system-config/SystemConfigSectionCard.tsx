"use client";

import type { ReactNode } from "react";

type Props = {
  title: string;
  icon: ReactNode;
  children: ReactNode;
};

export default function SystemConfigSectionCard({ title, icon, children }: Props) {
  return (
    <div className="mb-4 rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">{icon}</div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}
