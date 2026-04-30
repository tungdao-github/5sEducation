"use client";

type Props = {
  tx: (en: string, vi: string) => string;
  previewVideoUrl: string;
  setPreviewVideoUrl: (value: string) => void;
  thumbnail: File | null;
  setThumbnail: (value: File | null) => void;
  onPreviewVideoUpload: (file: File) => void;
};

export default function StudioCourseMediaFields({ tx, previewVideoUrl, setPreviewVideoUrl, thumbnail, setThumbnail, onPreviewVideoUpload }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{tx("Preview video URL", "Duong dan video xem truoc")}</label>
        <input value={previewVideoUrl} onChange={(e) => setPreviewVideoUrl(e.currentTarget.value)} className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm" />
        <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{tx("Upload preview video from computer", "Tai video xem truoc tu may tinh")}</label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => {
            const file = e.currentTarget.files?.[0];
            if (file) onPreviewVideoUpload(file);
            e.currentTarget.value = "";
          }}
          className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
        />
        <p className="text-xs text-emerald-800/70">{tx("The video will be saved in the local uploads/videos folder on the server.", "Video se duoc luu vao thu muc uploads/videos tren may chu.")}</p>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{tx("Thumbnail", "Anh dai dien")}</label>
        <input type="file" accept="image/*" onChange={(e) => setThumbnail(e.currentTarget.files?.[0] ?? null)} className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm" />
        <p className="text-xs text-emerald-800/70">{thumbnail ? thumbnail.name : tx("No thumbnail selected.", "Chua chon anh dai dien.")}</p>
      </div>
    </div>
  );
}
