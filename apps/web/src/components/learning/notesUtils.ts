"use client";

export function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.round(seconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remain = safeSeconds % 60;
  return `${minutes}:${String(remain).padStart(2, "0")}`;
}
