"use client";

import { StickyNote } from "lucide-react";

export default function NotesEmptyState() {
  return (
    <div className="py-12 text-center text-gray-400">
      <StickyNote className="mx-auto mb-3 size-12 opacity-50" />
      <p className="text-sm">Chua co ghi chu nao</p>
      <p className="mt-1 text-xs">Them ghi chu de danh dau nhung diem quan trong trong bai hoc.</p>
    </div>
  );
}
