import { useState } from 'react';
import { Plus, Trash2, Edit3, Check, X, StickyNote, Play } from 'lucide-react';
import { useLearning, LessonNote } from '../../contexts/LearningContext';
import { toast } from 'sonner';

interface Props {
  courseId: string;
  lessonId: string;
  currentTime?: number; // seconds
  onSeek?: (time: number) => void; // Callback to seek video
}

export default function NotesPanel({ courseId, lessonId, currentTime = 0, onSeek }: Props) {
  const { getNotes, addNote, deleteNote, updateNote } = useLearning();
  const notes = getNotes(courseId, lessonId);

  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleAdd = () => {
    if (!newContent.trim()) return;
    addNote(courseId, lessonId, newContent.trim(), currentTime);
    setNewContent('');
    toast.success('Đã thêm ghi chú');
  };

  const handleStartEdit = (note: LessonNote) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editContent.trim()) return;
    updateNote(editingId, editContent.trim());
    setEditingId(null);
    toast.success('Đã cập nhật ghi chú');
  };

  const handleDelete = (id: string) => {
    deleteNote(id);
    toast.success('Đã xóa ghi chú');
  };

  const handleSeek = (time: number) => {
    if (onSeek) {
      onSeek(time);
      toast.success(`Đã chuyển đến ${formatTime(time)}`);
    } else {
      // Mock seek notification
      toast.info(`Chuyển đến ${formatTime(time)} (Demo: feature sẽ hoạt động khi video player hỗ trợ)`);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        {/* Title */}
        <div className="flex items-center gap-2 mb-6">
          <StickyNote className="size-5 text-yellow-500" />
          <h2 className="font-bold text-gray-900">Ghi chú của bài học</h2>
          {notes.length > 0 && (
            <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
              {notes.length} ghi chú
            </span>
          )}
        </div>

        {/* Add note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500">
              ⏱ Tại {formatTime(currentTime)}
            </span>
          </div>
          <textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            placeholder="Thêm ghi chú cho bài học này... (gợi ý: highlight điểm quan trọng, đặt câu hỏi, hoặc liên kết với kiến thức khác)"
            rows={3}
            className="w-full text-sm bg-white border border-yellow-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-700"
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAdd();
            }}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">Ctrl+Enter để lưu nhanh</span>
            <button
              onClick={handleAdd}
              disabled={!newContent.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm font-medium"
            >
              <Plus className="size-4" /> Thêm ghi chú
            </button>
          </div>
        </div>

        {/* Notes list */}
        {notes.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <StickyNote className="size-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Chưa có ghi chú nào</p>
            <p className="text-xs mt-1">Thêm ghi chú để ghi nhớ những điểm quan trọng</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map(note => (
              <div key={note.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-yellow-300 transition group">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <button
                    onClick={() => handleSeek(note.timestamp)}
                    className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded font-mono hover:bg-blue-100 hover:text-blue-700 transition-colors flex items-center gap-1 group/seek"
                    title="Click để nhảy đến thời điểm này"
                  >
                    <Play className="size-3 opacity-0 group-hover/seek:opacity-100 transition-opacity" />
                    ⏱ {formatTime(note.timestamp)}
                  </button>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleStartEdit(note)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit3 className="size-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {editingId === note.id ? (
                  <div>
                    <textarea
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      rows={3}
                      className="w-full text-sm border border-blue-300 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition"
                      >
                        <Check className="size-3.5" /> Lưu
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-xs hover:bg-gray-50 transition"
                      >
                        <X className="size-3.5" /> Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                )}

                <p className="text-xs text-gray-400 mt-2">
                  {new Date(note.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
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
