"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle, Maximize2, Minimize2, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { type LearningLesson } from '../../data/api';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface VideoPlayerProps {
  lesson: LearningLesson;
  courseThumbnail: string;
  courseTitle: string;
  isCompleted: boolean;
  onComplete: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onTimeChange?: (seconds: number) => void;
  seekToSeconds?: number | null;
  seekVersion?: number;
}

function toEmbedUrl(url: string) {
  if (!url) return '';
  if (url.includes('youtube.com/watch?v=')) {
    const id = new URL(url).searchParams.get('v');
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0];
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }
  return url;
}

function isEmbeddable(url: string) {
  return /youtube\.com|youtu\.be|vimeo\.com/i.test(url);
}

function formatSeconds(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.round(totalSeconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export default function VideoPlayer({
  lesson,
  courseThumbnail,
  courseTitle,
  isCompleted,
  onComplete,
  onNext,
  onPrev,
  onTimeChange,
  seekToSeconds,
  seekVersion,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [markedComplete, setMarkedComplete] = useState(isCompleted);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(Math.round((lesson.durationMinutes || 0) * 60));

  useEffect(() => {
    setMarkedComplete(isCompleted);
  }, [isCompleted, lesson.id]);

  useEffect(() => {
    setPlaying(false);
    setPlaybackTime(0);
    setDurationSeconds(Math.round((lesson.durationMinutes || 0) * 60));
    onTimeChange?.(0);
  }, [lesson.id, lesson.durationMinutes, onTimeChange]);

  const embedUrl = useMemo(() => toEmbedUrl(lesson.videoUrl), [lesson.videoUrl]);
  const showIframe = lesson.type === 'video' && isEmbeddable(embedUrl);
  const showNativeVideo = lesson.type === 'video' && !!lesson.videoUrl && !showIframe;
  const progressPercent = durationSeconds > 0 ? Math.min(100, (playbackTime / durationSeconds) * 100) : 0;

  useEffect(() => {
    if (!showNativeVideo || seekToSeconds === null || seekToSeconds === undefined) return;
    const element = videoRef.current;
    if (!element) return;
    element.currentTime = Math.max(0, seekToSeconds);
    setPlaybackTime(Math.max(0, seekToSeconds));
    onTimeChange?.(Math.max(0, seekToSeconds));
  }, [seekToSeconds, seekVersion, showNativeVideo, onTimeChange]);

  const markComplete = () => {
    if (markedComplete) return;
    setMarkedComplete(true);
    onComplete();
  };

  const togglePlayback = () => {
    if (!showNativeVideo) {
      setPlaying((current) => !current);
      return;
    }

    const element = videoRef.current;
    if (!element) return;
    if (element.paused) {
      void element.play();
    } else {
      element.pause();
    }
  };

  if (lesson.type !== 'video') {
    return (
      <div className="relative flex w-full items-center justify-center bg-gradient-to-br from-indigo-700 to-blue-900" style={{ aspectRatio: '16/9' }}>
        <div className="p-8 text-center text-white">
          <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-white/20 text-4xl">QZ</div>
          <h3 className="mb-2 text-xl font-semibold">{lesson.title}</h3>
          <p className="text-sm text-blue-200">Quiz · {lesson.duration}</p>
          <p className="mt-4 text-sm text-blue-100">Chuyen sang tab Bai tap de lam quiz va cap nhat tien do that vao backend.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-black ${fullscreen ? 'fixed inset-0 z-50' : 'w-full'}`} style={{ aspectRatio: fullscreen ? undefined : '16/9' }}>
      {showIframe ? (
        <iframe
          src={embedUrl}
          title={lesson.title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : showNativeVideo ? (
        <video
          ref={videoRef}
          src={lesson.videoUrl}
          className="absolute inset-0 h-full w-full"
          controls
          poster={courseThumbnail || undefined}
          onLoadedMetadata={(event) => setDurationSeconds(Math.round(event.currentTarget.duration || lesson.durationMinutes * 60 || 0))}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(event) => {
            const nextTime = Math.round(event.currentTarget.currentTime || 0);
            setPlaybackTime(nextTime);
            onTimeChange?.(nextTime);
          }}
          onEnded={() => {
            setPlaying(false);
            markComplete();
          }}
        />
      ) : (
        <div className="absolute inset-0">
          {courseThumbnail ? (
            <ImageWithFallback src={courseThumbnail} alt={courseTitle} className="h-full w-full object-cover opacity-70" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-900 text-gray-400">Khong co video URL</div>
          )}
        </div>
      )}

      <div className="absolute left-3 top-3 rounded bg-black/60 px-2 py-1 text-xs text-white">{playing ? 'Dang phat' : 'Video bai hoc'}</div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 text-white">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{lesson.title}</p>
            <p className="text-xs text-white/70">
              {formatSeconds(playbackTime)} / {formatSeconds(durationSeconds)} · {markedComplete ? 'Da hoan thanh' : 'Chua hoan thanh'}
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
          <button onClick={togglePlayback} className="rounded-lg bg-white/10 px-3 py-2 text-sm transition hover:bg-white/20">
            {playing ? <Pause className="inline size-4" /> : <Play className="inline size-4" />}
          </button>
          <button onClick={markComplete} className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium transition hover:bg-green-700">
            Danh dau hoan thanh
          </button>
          <button onClick={onNext} disabled={!onNext} className="rounded-lg bg-white/10 px-3 py-2 text-sm transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40">
            <SkipForward className="inline size-4" />
          </button>
          <div className="flex-1" />
          <button onClick={() => setFullscreen((value) => !value)} className="rounded-lg bg-white/10 px-3 py-2 text-sm transition hover:bg-white/20">
            {fullscreen ? <Minimize2 className="inline size-4" /> : <Maximize2 className="inline size-4" />}
          </button>
        </div>

        {showIframe && (
          <p className="mt-3 text-xs text-white/60">
            Bai hoc dang dung player embed. Chuc nang ghi chu theo timestamp co the khong seek chinh xac tren moi nen tang embed.
          </p>
        )}
      </div>
    </div>
  );
}

