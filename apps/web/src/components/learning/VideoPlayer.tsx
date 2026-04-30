"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { type LearningLesson } from "@/services/api";
import { formatSeconds, isEmbeddable, toEmbedUrl } from "@/components/learning/videoPlayerUtils";
import VideoPlayerControls from "@/components/learning/VideoPlayerControls";
import VideoPlayerMedia from "@/components/learning/VideoPlayerMedia";

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
      <VideoPlayerMedia
        showIframe={showIframe}
        showNativeVideo={showNativeVideo}
        embedUrl={embedUrl}
        videoUrl={lesson.videoUrl}
        courseThumbnail={courseThumbnail}
        courseTitle={courseTitle}
        videoRef={videoRef}
        onLoadedMetadata={(duration) => setDurationSeconds(Math.round(duration || lesson.durationMinutes * 60 || 0))}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(nextTime) => {
          setPlaybackTime(nextTime);
          onTimeChange?.(nextTime);
        }}
        onEnded={() => {
          setPlaying(false);
          markComplete();
        }}
      />

      <div className="absolute left-3 top-3 rounded bg-black/60 px-2 py-1 text-xs text-white">{playing ? 'Dang phat' : 'Video bai hoc'}</div>
      <VideoPlayerControls
        title={lesson.title}
        playbackLabel={formatSeconds(playbackTime)}
        durationLabel={formatSeconds(durationSeconds)}
        markedComplete={markedComplete}
        progressPercent={progressPercent}
        playing={playing}
        onTogglePlayback={togglePlayback}
        onMarkComplete={markComplete}
        onNext={onNext}
        onPrev={onPrev}
        fullscreen={fullscreen}
        onToggleFullscreen={() => setFullscreen((value) => !value)}
        showEmbedNote={showIframe}
      />
    </div>
  );
}

