import { FileText, Link2, Download, BookOpen, Target, Info } from 'lucide-react';
import { CourseLessonItem } from '../../data/lessons';
import { toast } from 'sonner';

interface Props {
  lesson: CourseLessonItem;
}

const iconForResource = (type: CourseLessonItem['resources'][0]['type']) => {
  if (type === 'pdf') return <FileText className="size-4 text-red-500" />;
  if (type === 'link') return <Link2 className="size-4 text-blue-500" />;
  if (type === 'zip') return <Download className="size-4 text-gray-500" />;
  return <BookOpen className="size-4 text-purple-500" />;
};

export default function OverviewPanel({ lesson }: Props) {
  const handleDownload = (resource: CourseLessonItem['resources'][0]) => {
    toast.success(`Đang tải xuống: ${resource.title}${resource.size ? ` (${resource.size})` : ''}`, {
      description: 'Tài liệu sẽ được lưu vào thư mục Downloads của bạn',
    });
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Lesson info */}
        <div>
          <h2 className="font-bold text-gray-900 mb-1">{lesson.title}</h2>
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              {lesson.type === 'video' ? '▶' : lesson.type === 'quiz' ? '📝' : '📖'}
              {lesson.type === 'video' ? 'Video' : lesson.type === 'quiz' ? 'Bài kiểm tra' : 'Tài liệu đọc'}
            </span>
            <span>·</span>
            <span>{lesson.duration}</span>
            {lesson.isPreview && (
              <>
                <span>·</span>
                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-xs">Xem thử miễn phí</span>
              </>
            )}
          </div>

          {lesson.description && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="size-4 text-blue-500" />
                <span className="text-sm font-semibold text-gray-700">Về bài học này</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{lesson.description}</p>
            </div>
          )}
        </div>

        {/* Learning objectives */}
        {lesson.type === 'video' && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="size-4 text-green-600" />
              <h3 className="font-semibold text-gray-900 text-sm">Bạn sẽ học được gì?</h3>
            </div>
            <ul className="space-y-2">
              {getObjectives(lesson).map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                  {obj}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Resources */}
        {lesson.resources.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Download className="size-4 text-purple-600" />
              <h3 className="font-semibold text-gray-900 text-sm">Tài nguyên đính kèm</h3>
            </div>
            <div className="space-y-2">
              {lesson.resources.map(r => (
                <button
                  key={r.id}
                  onClick={() => handleDownload(r)}
                  className="w-full flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition group text-left"
                >
                  <div className="size-9 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition">
                    {iconForResource(r.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{r.title}</p>
                    <p className="text-xs text-gray-400 uppercase">{r.type}{r.size ? ` · ${r.size}` : ''}</p>
                  </div>
                  <Download className="size-4 text-gray-400 group-hover:text-blue-500 transition shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tips for quiz lessons */}
        {lesson.type === 'quiz' && lesson.exercise && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <h3 className="font-semibold text-orange-900 mb-2 text-sm flex items-center gap-2">
              <span>🧪</span> Về bài kiểm tra này
            </h3>
            <ul className="text-sm text-orange-800 space-y-1.5">
              <li>• <strong>{lesson.exercise.questions.length}</strong> câu hỏi</li>
              <li>• Điểm qua: <strong>{lesson.exercise.passingScore}%</strong></li>
              {lesson.exercise.timeLimit > 0 && (
                <li>• Thời gian: <strong>{lesson.exercise.timeLimit} phút</strong></li>
              )}
              <li>• Có thể làm lại không giới hạn số lần</li>
            </ul>
            <p className="text-xs text-orange-600 mt-3">
              Chuyển sang tab "Bài tập" để bắt đầu làm bài kiểm tra →
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Generate learning objectives based on lesson content
function getObjectives(lesson: CourseLessonItem): string[] {
  const desc = lesson.description;
  // Extract from description (sentences)
  const sentences = desc.split(/[.!?]/).map(s => s.trim()).filter(s => s.length > 20).slice(0, 3);
  if (sentences.length > 0) return sentences.map(s => s.charAt(0).toUpperCase() + s.slice(1));
  return [
    'Hiểu các khái niệm cốt lõi trong bài học',
    'Áp dụng kiến thức vào thực tiễn thiết kế',
    'Hoàn thành bài tập kiểm tra để củng cố kiến thức',
  ];
}
