"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "@/lib/router";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/app/providers";
import {
  buildLearningSections,
  fetchCourseById,
  fetchCourseBySlug,
  fetchLessons,
  fetchProgress,
  mapCourseDetail,
  type CourseModel,
  type LearningLesson,
  type LearningSection,
  updateCourseProgress,
} from "@/services/api";
import { toast } from "@/lib/notify";
import { buildCourseLearnTabs, type CourseLearnTabId } from "@/components/learning/courseLearnTabs";

export function useCourseLearnPage() {
  const { tx } = useI18n();
  const params = useParams() as { courseId?: string; id?: string; slug?: string };
  const courseKey = params.courseId ?? params.id ?? params.slug ?? "";
  const { isAuthenticated, openAuthModal } = useAuth();
  const [course, setCourse] = useState<CourseModel | null>(null);
  const [sections, setSections] = useState<LearningSection[]>([]);
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [completionPercent, setCompletionPercent] = useState(0);
  const [currentLesson, setCurrentLesson] = useState<LearningLesson | null>(null);
  const [activeTab, setActiveTab] = useState<CourseLearnTabId>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekRequest, setSeekRequest] = useState<{ time: number; version: number } | null>(null);

  const flatLessons = useMemo(() => sections.flatMap((section) => section.lessons), [sections]);

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    if (!courseKey) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const numericCourseKey = Number(courseKey);
        const courseDetail = Number.isFinite(numericCourseKey) && numericCourseKey > 0 ? await fetchCourseById(numericCourseKey) : await fetchCourseBySlug(courseKey);
        const resolvedCourseId = Number(courseDetail.id);
        const [courseLessons, progress] = await Promise.all([fetchLessons(resolvedCourseId), fetchProgress(resolvedCourseId)]);
        if (cancelled) return;

        const mappedCourse = mapCourseDetail(courseDetail);
        const learningSections = buildLearningSections(courseLessons);
        const learningLessons = learningSections.flatMap((section) => section.lessons);
        const initialLesson = learningLessons.find((lesson) => lesson.numericId === progress.lastLessonId) ?? learningLessons[0] ?? null;

        setCourse(mappedCourse);
        setSections(learningSections);
        setCompletedIds(progress.completedLessonIds ?? []);
        setCompletionPercent(progress.progressPercent ?? 0);
        setCurrentLesson(initialLesson);
      } catch (loadError) {
        if (!cancelled) {
          const message = loadError instanceof Error ? loadError.message : tx("Unable to load lesson.", "Không thể tải bài học.");
          setError(message);
          toast.error(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [courseKey, isAuthenticated, openAuthModal, tx]);

  useEffect(() => {
    if (currentLesson?.type === "quiz") {
      setActiveTab("overview");
    }
    setCurrentTime(0);
    setSeekRequest(null);
  }, [currentLesson?.id]);

  const currentIndex = flatLessons.findIndex((lesson) => lesson.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null;
  const isCurrentCompleted = !!currentLesson && completedIds.includes(currentLesson.numericId);

  const selectLesson = async (lesson: LearningLesson) => {
    setCurrentLesson(lesson);
    setActiveTab(lesson.type === "quiz" ? "exercise" : "overview");
    try {
      const snapshot = await updateCourseProgress({
        courseId: Number(course?.id ?? courseKey),
        lessonId: lesson.numericId,
        setAsLast: true,
      });
      setCompletedIds(snapshot.completedLessonIds ?? []);
      setCompletionPercent(snapshot.progressPercent ?? 0);
    } catch {
      // background sync only
    }
  };

  const handleLessonComplete = async () => {
    if (!currentLesson || !course) return;
    try {
      const snapshot = await updateCourseProgress({
        courseId: Number(course.id),
        lessonId: currentLesson.numericId,
        isCompleted: true,
        setAsLast: true,
      });
      setCompletedIds(snapshot.completedLessonIds ?? []);
      setCompletionPercent(snapshot.progressPercent ?? 0);
      toast.success(tx("Learning progress updated.", "Đã cập nhật tiến độ học tập."));
    } catch (completeError) {
      toast.error(completeError instanceof Error ? completeError.message : tx("Unable to update progress.", "Cập nhật tiến độ thất bại."));
    }
  };

  const handleSeekFromNotes = (time: number) => {
    setSeekRequest((current) => ({
      time,
      version: (current?.version ?? 0) + 1,
    }));
  };

  return {
    isAuthenticated,
    courseKey,
    course,
    sections,
    completedIds,
    completionPercent,
    currentLesson,
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    loading,
    error,
    currentTime,
    setCurrentTime,
    seekRequest,
    prevLesson,
    nextLesson,
    isCurrentCompleted,
    selectLesson,
    handleLessonComplete,
    handleSeekFromNotes,
    tabs: buildCourseLearnTabs(tx),
  } as const;
}
