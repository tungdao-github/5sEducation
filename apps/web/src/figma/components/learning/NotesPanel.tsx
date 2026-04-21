"use client";

import { useState } from 'react';
import { Check, Edit3, Play, Plus, StickyNote, Trash2, X } from 'lucide-react';
import { toast } from '@/figma/compat/sonner';
import { useLearning, LessonNote } from '../../contexts/LearningContext';

interface Props {
  courseId: string;
  lessonId: string;
  currentTime?: number;
  onSeek?: (time: number) => void;
}

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.round(seconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remain = safeSeconds % 60;
  return `${minutes}:${String(remain).padStart(2, '0')}`;
}

export default function NotesPanel({ courseId, lessonId, currentTime = 0, onSeek }: Props) {
  const { getNotes, addNote, deleteNote, updateNote } = useLearning();
  const notes = getNotes(courseId, lessonId);

  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAdd = () => {
    const trimmed = newContent.trim();
    if (!trimmed) return;
    addNote(courseId, lessonId, trimmed, currentTime);
    setNewContent('');
    toast.success('Da them ghi chu.');
  };

  const handleStartEdit = (note: LessonNote) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = () => {
    const trimmed = editContent.trim();
    if (!editingId || !trimmed) return;
    updateNote(editingId, trimmed);
    setEditingId(null);
    toast.success('Da cap nhat ghi chu.');
  };

  const handleDelete = (id: string) => {
    deleteNote(id);
    toast.success('Da xoa ghi chu.');
  };

  const handleSeek = (time: number) => {
    if (!onSeek) {
      toast.info(`Timestamp ${formatTime(time)} da duoc chon. Player hien tai khong ho tro seek truc tiep.`);
      return;
    }

    onSeek(time);
    toast.success(`Da chuyen toi ${formatTime(time)}.`);
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-2">
          <StickyNote className="size-5 text-yellow-500" />
          <h2 className="font-bold text-gray-900">Ghi chu cua bai hoc</h2>
          {notes.length > 0 && (
            <span className="ml-auto rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
              {notes.length} ghi chu
            </span>
          )}
        </div>

        <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs text-gray-500">Tai {formatTime(currentTime)}</span>
          </div>
          <textarea
            value={newContent}
            onChange={(event) => setNewContent(event.target.value)}
            placeholder="Them ghi chu cho bai hoc nay..."
            rows={3}
            className="w-full resize-none rounded-lg border border-yellow-200 bg-white p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            onKeyDown={(event) => {
              if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                handleAdd();
              }
            }}
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-xs text-gray-400">Ctrl+Enter de luu nhanh</span>
            <button
              onClick={handleAdd}
              disabled={!newContent.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="size-4" /> Them ghi chu
            </button>
          </div>
        </div>

        {notes.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <StickyNote className="mx-auto mb-3 size-12 opacity-50" />
            <p className="text-sm">Chua co ghi chu nao</p>
            <p className="mt-1 text-xs">Them ghi chu de danh dau nhung diem quan trong trong bai hoc.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="group rounded-xl border border-gray-200 bg-white p-4 transition hover:border-yellow-300">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <button
                    onClick={() => handleSeek(note.timestamp)}
                    className="flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 font-mono text-xs text-blue-500 transition hover:bg-blue-100 hover:text-blue-700"
                    title="Click de nhay toi moc thoi gian nay"
                  >
                    <Play className="size-3" /> {formatTime(note.timestamp)}
                  </button>
                  <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                    <button onClick={() => handleStartEdit(note)} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600">
                      <Edit3 className="size-3.5" />
                    </button>
                    <button onClick={() => handleDelete(note.id)} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {editingId === note.id ? (
                  <div>
                    <textarea
                      value={editContent}
                      onChange={(event) => setEditContent(event.target.value)}
                      rows={3}
                      className="mb-2 w-full resize-none rounded-lg border border-blue-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button onClick={handleSaveEdit} className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white transition hover:bg-blue-700">
                        <Check className="size-3.5" /> Luu
                      </button>
                      <button onClick={() => setEditingId(null)} className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 transition hover:bg-gray-50">
                        <X className="size-3.5" /> Huy
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{note.content}</p>
                )}

                <p className="mt-2 text-xs text-gray-400">
                  {new Date(note.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

