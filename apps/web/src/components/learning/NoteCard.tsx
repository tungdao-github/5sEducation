"use client";

import { Check, Edit3, Play, Trash2, X } from "lucide-react";
import { formatTime } from "@/components/learning/notesUtils";
import type { LessonNote } from "@/contexts/LearningContext";

type Props = {
  note: LessonNote;
  isEditing: boolean;
  editContent: string;
  onStartEdit: (note: LessonNote) => void;
  onDelete: (id: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditContentChange: (value: string) => void;
  onSeek: (time: number) => void;
};

export default function NoteCard({
  note,
  isEditing,
  editContent,
  onStartEdit,
  onDelete,
  onSaveEdit,
  onCancelEdit,
  onEditContentChange,
  onSeek,
}: Props) {
  return (
    <div key={note.id} className="group rounded-xl border border-gray-200 bg-white p-4 transition hover:border-yellow-300">
      <div className="mb-2 flex items-start justify-between gap-2">
        <button
          onClick={() => onSeek(note.timestamp)}
          className="flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 font-mono text-xs text-blue-500 transition hover:bg-blue-100 hover:text-blue-700"
          title="Click de nhay toi moc thoi gian nay"
        >
          <Play className="size-3" /> {formatTime(note.timestamp)}
        </button>
        <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          <button onClick={() => onStartEdit(note)} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600">
            <Edit3 className="size-3.5" />
          </button>
          <button onClick={() => onDelete(note.id)} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500">
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div>
          <textarea
            value={editContent}
            onChange={(event) => onEditContentChange(event.target.value)}
            rows={3}
            className="mb-2 w-full resize-none rounded-lg border border-blue-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={onSaveEdit} className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white transition hover:bg-blue-700">
              <Check className="size-3.5" /> Luu
            </button>
            <button onClick={onCancelEdit} className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 transition hover:bg-gray-50">
              <X className="size-3.5" /> Huy
            </button>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{note.content}</p>
      )}

      <p className="mt-2 text-xs text-gray-400">
        {new Date(note.createdAt).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
}
