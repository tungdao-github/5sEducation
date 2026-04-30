"use client";

type Props = {
  tx: (en: string, vi: string) => string;
  isPublished: boolean;
  setIsPublished: (value: boolean) => void;
};

export default function StudioCoursePublishActions({ tx, isPublished, setIsPublished }: Props) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="flex items-center gap-2 text-sm text-emerald-900">
        <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.currentTarget.checked)} className="h-4 w-4" />
        {tx("Publish immediately", "Cong khai ngay")}
      </label>
      <button type="submit" className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white">
        {tx("Save changes", "Luu thay doi")}
      </button>
    </div>
  );
}
