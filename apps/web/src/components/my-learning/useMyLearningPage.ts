"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchCoursesByIds, fetchEnrollments, mapCourseCompare } from "@/services/api";
import type { Course } from "@/contexts/CartContext";
import type { LearningCourse } from "@/components/my-learning/myLearningTypes";

export function useMyLearningPage() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { language } = useLanguage();
  const [courses, setCourses] = useState<LearningCourse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    if (!isAuthenticated) {
      setCourses([]);
      return () => {
        active = false;
      };
    }

    const load = async () => {
      setLoading(true);
      try {
        const enrollments = await fetchEnrollments();
        if (!active) return;

        if (enrollments.length === 0) {
          setCourses([]);
          return;
        }

        const ids = enrollments.map((enrollment) => enrollment.courseId);
        const compareDtos = await fetchCoursesByIds(ids);
        if (!active) return;

        const courseMap = new Map(compareDtos.map((dto) => [dto.id, mapCourseCompare(dto, language)]));
        const merged = enrollments.map((enrollment) => {
          const base = courseMap.get(enrollment.courseId);
          const fallback: Course = base ?? {
            id: String(enrollment.courseId),
            slug: enrollment.courseSlug,
            title: enrollment.courseTitle,
            price: 0,
            image: enrollment.thumbnailUrl,
            instructor: "Đang cập nhật",
            duration: "—",
            level: "—",
            lessons: enrollment.totalLessons,
            students: 0,
            rating: 0,
            category: "Khác",
            description: "",
            learningOutcomes: [],
            curriculum: [],
          };

          return {
            ...fallback,
            progress: enrollment.progressPercent,
            lastAccessed: enrollment.createdAt,
            completedLessons: enrollment.completedLessons,
            totalLessons: enrollment.totalLessons,
          } as LearningCourse;
        });

        setCourses(merged);
      } catch {
        if (!active) return;
        setCourses([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [isAuthenticated, language]);

  const inProgressCourses = courses.filter((course) => course.progress > 0 && course.progress < 100);
  const completedCourses = courses.filter((course) => course.progress >= 100);
  const notStartedCourses = courses.filter((course) => course.progress === 0);

  return {
    isAuthenticated,
    openAuthModal,
    courses,
    loading,
    inProgressCourses,
    completedCourses,
    notStartedCourses,
  } as const;
}
