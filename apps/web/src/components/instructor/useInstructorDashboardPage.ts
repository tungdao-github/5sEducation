"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useInstructor } from "@/contexts/InstructorContext";

export function useInstructorDashboardPage() {
  const { isInstructor, user } = useAuth();
  const { stats, courses } = useInstructor();
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "revenue">("overview");

  const topCourses = useMemo(() => [...courses].slice(0, 5), [courses]);

  return {
    isInstructor,
    user,
    stats,
    courses,
    activeTab,
    setActiveTab,
    topCourses,
  } as const;
}
