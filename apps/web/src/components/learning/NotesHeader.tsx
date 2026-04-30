"use client";

import { StickyNote } from "lucide-react";

type Props = {
  notesCount: number;
};

export default function NotesHeader({ notesCount }: Props) {
  return (
    <div className="mb-6 flex items-center gap-2">
      <StickyNote className="size-5 text-yellow-500" />
      <h2 className="font-bold text-gray-900">Ghi chu cua bai hoc</h2>
      {notesCount > 0 && (
        <span className="ml-auto rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
          {notesCount} ghi chu
        </span>
      )}
    </div>
  );
}
