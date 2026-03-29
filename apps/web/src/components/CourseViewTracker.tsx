"use client";

import { useEffect } from "react";
import { API_URL } from "@/lib/api";

export function CourseViewTracker({ courseId }: { courseId: number }) {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_URL}/api/history/views`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ courseId }),
    }).catch(() => undefined);
  }, [courseId]);

  return null;
}
