"use client";

import { ImageWithFallback } from "@/components/shared/ImageWithFallback";

type Props = {
  showIframe: boolean;
  showNativeVideo: boolean;
  embedUrl: string;
  videoUrl: string;
  courseThumbnail: string;
  courseTitle: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onLoadedMetadata: (duration: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onTimeUpdate: (seconds: number) => void;
  onEnded: () => void;
};

export default function VideoPlayerMedia({
  showIframe,
  showNativeVideo,
  embedUrl,
  videoUrl,
  courseThumbnail,
  courseTitle,
  videoRef,
  onLoadedMetadata,
  onPlay,
  onPause,
  onTimeUpdate,
  onEnded,
}: Props) {
  if (showIframe) {
    return (
      <iframe
        src={embedUrl}
        title={courseTitle}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  if (showNativeVideo) {
    return (
      <video
        ref={videoRef}
        src={videoUrl}
        className="absolute inset-0 h-full w-full"
        controls
        poster={courseThumbnail || undefined}
        onLoadedMetadata={(event) => onLoadedMetadata(Math.round(event.currentTarget.duration || 0))}
        onPlay={onPlay}
        onPause={onPause}
        onTimeUpdate={(event) => onTimeUpdate(Math.round(event.currentTarget.currentTime || 0))}
        onEnded={onEnded}
      />
    );
  }

  return (
    <div className="absolute inset-0">
      {courseThumbnail ? (
        <ImageWithFallback src={courseThumbnail} alt={courseTitle} className="h-full w-full object-cover opacity-70" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-900 text-gray-400">Khong co video URL</div>
      )}
    </div>
  );
}
