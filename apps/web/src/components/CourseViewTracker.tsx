"use client";

import { useEffect } from "react";
import { trackCourseView } from "@/services/api";

export function CourseViewTracker({ courseId }: { courseId: number }) {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    trackCourseView(courseId).catch(() => undefined);
  }, [courseId]);

  return null;
}
