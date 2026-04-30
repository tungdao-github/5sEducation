"use client";

import { CheckCircle, Maximize2, Minimize2, Pause, Play, SkipBack, SkipForward } from "lucide-react";

type Props = {
  title: string;
  playbackLabel: string;
  durationLabel: string;
  markedComplete: boolean;
  progressPercent: number;
  playing: boolean;
  onTogglePlayback: () => void;
  onMarkComplete: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  showEmbedNote: boolean;
};

export default function VideoPlayerControls({
  title,
  playbackLabel,
  durationLabel,
  markedComplete,
  progressPercent,
  playing,
  onTogglePlayback,
  onMarkComplete,
  onNext,
  onPrev,
  fullscreen,
  onToggleFullscreen,
  showEmbedNote,
}: Props) {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 text-white">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-white/70">
            {playbackLabel} / {durationLabel} · {markedComplete ? "Da hoan thanh" : "Chua hoan thanh"}
          </p>
        </div>
        {markedComplete && <CheckCircle className="size-5 text-green-400" />}
      </div>

      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/15">
        <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={onPrev} disabled={!onPrev} className="rounded-lg bg-white/10 px-3 py-2 text-sm transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40">
          <SkipBack className="inline size-4" />
        </button>
        <button onClick={onTogglePlayback} className="rounded-lg bg-white/10 px-3 py-2 text-sm transition hover:bg-white/20">
          {playing ? <Pause className="inline size-4" /> : <Play className="inline size-4" />}
        </button>
        <button onClick={onMarkComplete} className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium transition hover:bg-green-700">
          Danh dau hoan thanh
        </button>
        <button onClick={onNext} disabled={!onNext} className="rounded-lg bg-white/10 px-3 py-2 text-sm transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40">
          <SkipForward className="inline size-4" />
        </button>
        <div className="flex-1" />
        <button onClick={onToggleFullscreen} className="rounded-lg bg-white/10 px-3 py-2 text-sm transition hover:bg-white/20">
          {fullscreen ? <Minimize2 className="inline size-4" /> : <Maximize2 className="inline size-4" />}
        </button>
      </div>

      {showEmbedNote && (
        <p className="mt-3 text-xs text-white/60">
          Bai hoc dang dung player embed. Chuc nang ghi chu theo timestamp co the khong seek chinh xac tren moi nen tang embed.
        </p>
      )}
    </div>
  );
}
