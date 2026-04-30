"use client";

import { useState } from 'react';
import { toast } from '@/lib/notify';
import { useLearning, LessonNote } from "@/contexts/LearningContext";
import { formatTime } from "@/components/learning/notesUtils";
import NotesHeader from "@/components/learning/NotesHeader";
import NoteComposer from "@/components/learning/NoteComposer";
import NotesEmptyState from "@/components/learning/NotesEmptyState";
import NoteCard from "@/components/learning/NoteCard";

interface Props {
  courseId: string;
  lessonId: string;
  currentTime?: number;
  onSeek?: (time: number) => void;
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
        <NotesHeader notesCount={notes.length} />
        <NoteComposer currentTimeLabel={formatTime(currentTime)} value={newContent} onChange={setNewContent} onSubmit={handleAdd} />

        {notes.length === 0 ? (
          <NotesEmptyState />
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isEditing={editingId === note.id}
                editContent={editContent}
                onStartEdit={handleStartEdit}
                onDelete={handleDelete}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={() => setEditingId(null)}
                onEditContentChange={setEditContent}
                onSeek={handleSeek}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

