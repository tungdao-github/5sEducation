"use client";

import { BookOpen, Download, FileText, Info, Link2, PenSquare, PlayCircle, Target } from 'lucide-react';
import { toast } from '@/figma/compat/sonner';
import { type LearningLesson } from '../../data/api';

interface Props {
  lesson: LearningLesson;
}

function iconForResource(type: LearningLesson['resources'][number]['type']) {
  if (type === 'pdf') return <FileText className="size-4 text-red-500" />;
  if (type === 'link') return <Link2 className="size-4 text-blue-500" />;
  if (type === 'zip') return <Download className="size-4 text-gray-500" />;
  return <BookOpen className="size-4 text-purple-500" />;
}

function getObjectives(lesson: LearningLesson) {
  const sentences = (lesson.description || '')
    .split(/[.!?]/)
    .map((value) => value.trim())
    .filter((value) => value.length > 20)
    .slice(0, 3);

  if (sentences.length > 0) {
    return sentences.map((value) => value.charAt(0).toUpperCase() + value.slice(1));
  }

  return [
    'Hieu cac khai niem cot loi trong bai hoc.',
    'Ap dung kien thuc vao quy trinh hoc tap thuc te.',
    'Ket hop ghi chu, tai nguyen va quiz de cung co noi dung.',
  ];
}

export default function OverviewPanel({ lesson }: Props) {
  const handleOpenResource = (resource: LearningLesson['resources'][number]) => {
    if (resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
      return;
    }

    toast.info(`Tai nguyen ${resource.title} chua co URL.`);
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h2 className="mb-1 text-xl font-bold text-gray-900">{lesson.title}</h2>
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1">
              {lesson.type === 'quiz' ? <PenSquare className="size-4" /> : <PlayCircle className="size-4" />}
              {lesson.type === 'quiz' ? 'Quiz' : 'Video'}
            </span>
            <span>·</span>
            <span>{lesson.duration}</span>
            {lesson.isPreview && (
              <>
                <span>·</span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">Xem thu mien phi</span>
              </>
            )}
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Info className="size-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-700">Ve bai hoc nay</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-600">{lesson.description || 'Noi dung bai hoc se duoc truyen truc tiep tu backend.'}</p>
          </div>
        </div>

        {lesson.type === 'video' && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Target className="size-4 text-green-600" />
              <h3 className="text-sm font-semibold text-gray-900">Ban se hoc duoc gi?</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              {getObjectives(lesson).map((objective, index) => (
                <li key={`${lesson.id}-objective-${index}`} className="flex items-start gap-2">
                  <span className="mt-0.5 text-green-500">+</span>
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {lesson.resources.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Download className="size-4 text-purple-600" />
              <h3 className="text-sm font-semibold text-gray-900">Tai nguyen dinh kem</h3>
            </div>
            <div className="space-y-2">
              {lesson.resources.map((resource) => (
                <button
                  key={resource.id}
                  onClick={() => handleOpenResource(resource)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left transition hover:border-blue-300 hover:bg-blue-50"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 transition group-hover:bg-blue-100">
                    {iconForResource(resource.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">{resource.title}</p>
                    <p className="text-xs uppercase text-gray-400">
                      {resource.type}
                      {resource.size ? ` · ${resource.size}` : ''}
                    </p>
                  </div>
                  <Download className="size-4 shrink-0 text-gray-400 transition group-hover:text-blue-500" />
                </button>
              ))}
            </div>
          </div>
        )}

        {lesson.type === 'quiz' && lesson.exercise && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-orange-900">
              <PenSquare className="size-4" /> Ve bai quiz nay
            </h3>
            <ul className="space-y-1.5 text-sm text-orange-800">
              <li>So cau hoi: <strong>{lesson.exercise.questions.length}</strong></li>
              <li>Diem dat: <strong>{lesson.exercise.passingScore}%</strong></li>
              {lesson.exercise.timeLimit > 0 && <li>Thoi gian: <strong>{lesson.exercise.timeLimit} phut</strong></li>}
              <li>Co the lam lai nhieu lan de cai thien ket qua.</li>
            </ul>
            <p className="mt-3 text-xs text-orange-600">Chuyen sang tab Bai tap de lam quiz va nop dap an that vao backend.</p>
          </div>
        )}
      </div>
    </div>
  );
}

