import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2,
  CheckCircle, SkipBack, SkipForward, Settings,
} from 'lucide-react';
import { CourseLessonItem } from '../../data/lessons';

interface VideoPlayerProps {
  lesson: CourseLessonItem;
  courseThumbnail: string;
  courseTitle: string;
  isCompleted: boolean;
  onComplete: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

// Parse "MM:SS" → seconds
function parseDuration(d: string): number {
  const parts = d.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 300; // fallback 5 min
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function VideoPlayer({
  lesson,
  courseThumbnail,
  courseTitle,
  isCompleted,
  onComplete,
  onNext,
  onPrev,
}: VideoPlayerProps) {
  const totalDuration = lesson.type === 'video' ? parseDuration(lesson.duration) : 0;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [hasMarkedComplete, setHasMarkedComplete] = useState(isCompleted);
  const [showCompleteBanner, setShowCompleteBanner] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync isCompleted prop
  useEffect(() => {
    setHasMarkedComplete(isCompleted);
  }, [isCompleted]);

  // Simulated playback engine
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!isPlaying || totalDuration === 0) return;

    intervalRef.current = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + speed;
        if (next >= totalDuration) {
          setIsPlaying(false);
          if (!hasMarkedComplete) {
            setHasMarkedComplete(true);
            setShowCompleteBanner(true);
            onComplete();
            setTimeout(() => setShowCompleteBanner(false), 4000);
          }
          return totalDuration;
        }
        return next;
      });
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed, totalDuration, hasMarkedComplete, onComplete]);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    if (isPlaying) {
      hideControlsTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    resetHideTimer();
    return () => { if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current); };
  }, [isPlaying, resetHideTimer]);

  // Reset on lesson change
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setHasMarkedComplete(isCompleted);
  }, [lesson.id, isCompleted]);

  const togglePlay = () => setIsPlaying(p => !p);
  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setCurrentTime(Math.max(0, Math.min(totalDuration, ratio * totalDuration)));
  };

  const handleManualComplete = () => {
    setHasMarkedComplete(true);
    setCurrentTime(totalDuration);
    onComplete();
    setShowCompleteBanner(true);
    setTimeout(() => setShowCompleteBanner(false), 3000);
  };

  // For non-video lessons (quiz/reading), show a static card
  if (lesson.type !== 'video') {
    return (
      <div className="relative w-full bg-gradient-to-br from-indigo-700 to-blue-900 flex items-center justify-center"
        style={{ aspectRatio: '16/9' }}>
        <div className="text-center text-white p-8">
          <div className="size-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">
              {lesson.type === 'quiz' ? '🧪' : '📖'}
            </span>
          </div>
          <h3 className="text-xl mb-2">{lesson.title}</h3>
          <p className="text-blue-200 text-sm">
            {lesson.type === 'quiz' ? `Bài kiểm tra · ${lesson.duration}` : `Tài liệu đọc · ${lesson.duration}`}
          </p>
          <p className="text-blue-300 text-sm mt-4">
            {lesson.type === 'quiz'
              ? 'Hoàn thành bài kiểm tra trong tab "Bài tập" bên dưới'
              : 'Nội dung bài đọc hiển thị bên dưới'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-black select-none overflow-hidden group ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
      style={{ aspectRatio: isFullscreen ? undefined : '16/9', height: isFullscreen ? '100%' : '100%' }}
      onMouseMove={resetHideTimer}
      onClick={() => { if (!showSpeedMenu) togglePlay(); }}
    >
      {/* Thumbnail / "video" frame */}
      <img
        src={courseThumbnail}
        alt={courseTitle}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${isPlaying ? 'scale-105' : 'scale-100'}`}
      />
      {/* Dark overlay */}
      <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${isPlaying ? 'opacity-40' : 'opacity-60'}`} />

      {/* Demo badge */}
      {!isPlaying && (
        <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
          📹 Video Demo
        </div>
      )}

      {/* Completion Banner */}
      {showCompleteBanner && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-green-500 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg animate-bounce">
          <CheckCircle className="size-5" />
          <span>Bài học đã hoàn thành!</span>
        </div>
      )}

      {/* Center Play Button */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="size-20 bg-white/25 backdrop-blur-sm border-2 border-white/50 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
            <Play className="size-8 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Controls */}
      <div
        className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 z-10
          ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="px-4 pb-1">
          <div
            className="w-full h-1.5 bg-white/30 rounded-full cursor-pointer group/prog hover:h-2.5 transition-all"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-blue-500 rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 size-3.5 bg-white rounded-full shadow opacity-0 group-hover/prog:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Control bar */}
        <div className="flex items-center gap-2 px-4 pb-4 pt-1">
          {/* Skip back */}
          <button
            className="text-white hover:text-blue-300 transition p-1"
            onClick={() => { if (onPrev) { onPrev(); } else { setCurrentTime(Math.max(0, currentTime - 10)); } }}
            title="Bài trước / Tua lại 10s"
          >
            <SkipBack className="size-5" />
          </button>

          {/* Play/Pause */}
          <button
            className="text-white hover:text-blue-300 transition p-1"
            onClick={togglePlay}
          >
            {isPlaying
              ? <Pause className="size-6" />
              : <Play className="size-6 fill-white" />}
          </button>

          {/* Skip forward */}
          <button
            className="text-white hover:text-blue-300 transition p-1"
            onClick={() => { if (onNext) { onNext(); } else { setCurrentTime(Math.min(totalDuration, currentTime + 10)); } }}
            title="Bài tiếp / Tua tới 10s"
          >
            <SkipForward className="size-5" />
          </button>

          {/* Time */}
          <span className="text-white text-xs ml-1 tabular-nums">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </span>

          <div className="flex-1" />

          {/* Volume */}
          <div className="flex items-center gap-1">
            <button
              className="text-white hover:text-blue-300 transition p-1"
              onClick={() => setIsMuted(m => !m)}
            >
              {isMuted || volume === 0
                ? <VolumeX className="size-5" />
                : <Volume2 className="size-5" />}
            </button>
            <input
              type="range"
              min={0} max={100}
              value={isMuted ? 0 : volume}
              onChange={e => { setVolume(+e.target.value); setIsMuted(false); }}
              className="w-16 h-1 accent-blue-500 cursor-pointer"
              onClick={e => e.stopPropagation()}
            />
          </div>

          {/* Speed */}
          <div className="relative">
            <button
              className="text-white text-xs hover:text-blue-300 transition px-2 py-1 border border-white/40 rounded"
              onClick={e => { e.stopPropagation(); setShowSpeedMenu(s => !s); }}
            >
              <Settings className="size-3.5 inline mr-1" />{speed}x
            </button>
            {showSpeedMenu && (
              <div className="absolute bottom-8 right-0 bg-gray-900 border border-gray-700 rounded shadow-xl py-1 z-30 min-w-[80px]">
                {SPEEDS.map(s => (
                  <button
                    key={s}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 transition ${speed === s ? 'text-blue-400' : 'text-white'}`}
                    onClick={e => { e.stopPropagation(); setSpeed(s); setShowSpeedMenu(false); }}
                  >
                    {s}x {speed === s && '✓'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mark complete */}
          <button
            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded transition ${
              hasMarkedComplete
                ? 'bg-green-600 text-white cursor-default'
                : 'bg-white/20 text-white hover:bg-white/30 border border-white/40'
            }`}
            onClick={e => { e.stopPropagation(); if (!hasMarkedComplete) handleManualComplete(); }}
            title="Đánh dấu hoàn thành"
          >
            <CheckCircle className="size-4" />
            <span className="hidden sm:inline">
              {hasMarkedComplete ? 'Đã học xong' : 'Đánh dấu xong'}
            </span>
          </button>

          {/* Fullscreen */}
          <button
            className="text-white hover:text-blue-300 transition p-1"
            onClick={e => { e.stopPropagation(); setIsFullscreen(f => !f); }}
          >
            {isFullscreen ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
          </button>
        </div>
      </div>

      {/* ESC for fullscreen */}
      {isFullscreen && (
        <button
          className="absolute top-4 right-4 z-50 bg-black/60 text-white px-3 py-1.5 rounded text-sm"
          onClick={e => { e.stopPropagation(); setIsFullscreen(false); }}
        >
          ESC · Thoát
        </button>
      )}
    </div>
  );
}