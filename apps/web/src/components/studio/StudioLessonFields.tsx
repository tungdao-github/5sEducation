"use client";

import type { TxFn } from "@/components/studio/studioLessonsTypes";

type Props = {
  tx: TxFn;
  lessonTitle: string;
  setLessonTitle: (value: string) => void;
  lessonContentType: string;
  setLessonContentType: (value: string) => void;
  lessonDuration: string;
  setLessonDuration: (value: string) => void;
  lessonVideoUrl: string;
  setLessonVideoUrl: (value: string) => void;
  lessonSortOrder: string;
  setLessonSortOrder: (value: string) => void;
  isUploadingVideo: boolean;
  onUploadVideo: (file: File) => void;
};

export default function StudioLessonFields({
  tx,
  lessonTitle,
  setLessonTitle,
  lessonContentType,
  setLessonContentType,
  lessonDuration,
  setLessonDuration,
  lessonVideoUrl,
  setLessonVideoUrl,
  lessonSortOrder,
  setLessonSortOrder,
  isUploadingVideo,
  onUploadVideo,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{tx("Lesson title", "Tieu de bai hoc")}</label>
        <input value={lessonTitle} onChange={(e) => setLessonTitle(e.currentTarget.value)} className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm" />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{tx("Lesson type", "Loai bai hoc")}</label>
        <select value={lessonContentType} onChange={(e) => setLessonContentType(e.currentTarget.value)} className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm">
          <option value="video">{tx("Video", "Video")}</option>
          <option value="exercise">{tx("Exercise", "Bai tap")}</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{tx("Duration (mins)", "Thoi luong (phut)")}</label>
        <input type="number" min="1" step="0.5" value={lessonDuration} onChange={(e) => setLessonDuration(e.currentTarget.value)} className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm" />
      </div>
      {lessonContentType === "video" ? (
        <>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{tx("Video URL", "Duong dan video")}</label>
            <input value={lessonVideoUrl} onChange={(e) => setLessonVideoUrl(e.currentTarget.value)} className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{tx("Upload video from computer", "Tai video tu may tinh")}</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.currentTarget.files?.[0];
                if (file) onUploadVideo(file);
                e.currentTarget.value = "";
              }}
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
            />
            <p className="text-xs text-emerald-800/70">{tx("The system will save the video locally and fill the lesson URL automatically.", "He thong se luu video cuc bo va tu dong dien link bai hoc.")}</p>
            {isUploadingVideo ? <p className="text-xs font-semibold text-emerald-700">{tx("Uploading video...", "Dang tai video...")}</p> : null}
          </div>
        </>
      ) : null}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{tx("Sort order", "Thu tu")}</label>
        <input type="number" value={lessonSortOrder} onChange={(e) => setLessonSortOrder(e.currentTarget.value)} className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm" />
      </div>
    </div>
  );
}
