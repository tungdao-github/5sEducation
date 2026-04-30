"use client";

import { Plus } from "lucide-react";

type Props = {
  currentTimeLabel: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export default function NoteComposer({ currentTimeLabel, value, onChange, onSubmit }: Props) {
  return (
    <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs text-gray-500">Tai {currentTimeLabel}</span>
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Them ghi chu cho bai hoc nay..."
        rows={3}
        className="w-full resize-none rounded-lg border border-yellow-200 bg-white p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
            onSubmit();
          }
        }}
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-xs text-gray-400">Ctrl+Enter de luu nhanh</span>
        <button
          onClick={onSubmit}
          disabled={!value.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="size-4" /> Them ghi chu
        </button>
      </div>
    </div>
  );
}
