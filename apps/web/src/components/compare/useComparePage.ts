"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "@/lib/notify";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchCourses, fetchCoursesByIds, mapCourseCompare, mapCourseList } from "@/services/api";
import type { Course } from "@/contexts/CartContext";

const MAX_COMPARE = 3;

export function useComparePage() {
  const { language } = useLanguage();
  const { addToCart } = useCart();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchCourses({ pageSize: 60, sort: "popular" })
      .then((dtos) => {
        if (active) setAllCourses(dtos.map((dto) => mapCourseList(dto, language)));
      })
      .catch(() => {
        if (active) setAllCourses([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [language]);

  useEffect(() => {
    let active = true;
    if (selectedIds.length === 0) {
      setSelectedCourses([]);
      return () => {
        active = false;
      };
    }
    fetchCoursesByIds(selectedIds.map((id) => Number(id)))
      .then((dtos) => {
        if (active) setSelectedCourses(dtos.map((dto) => mapCourseCompare(dto, language)));
      })
      .catch(() => {
        if (active) setSelectedCourses([]);
      });
    return () => {
      active = false;
    };
  }, [language, selectedIds]);

  const availableCourses = useMemo(() => allCourses.filter((course) => !selectedIds.includes(course.id)), [allCourses, selectedIds]);

  const addCourse = (course: Course) => {
    const { id } = course;
    if (selectedIds.length >= MAX_COMPARE) {
      toast.warning(`Chỉ so sánh tối đa ${MAX_COMPARE} khóa học`);
      return;
    }
    if (selectedIds.includes(id)) {
      toast.info("Khóa học đã được chọn");
      return;
    }
    setSelectedIds((current) => [...current, id]);
    setShowPicker(false);
  };

  const removeCourse = (id: string) => setSelectedIds((current) => current.filter((entry) => entry !== id));

  return {
    loading,
    allCourses,
    selectedCourses,
    availableCourses,
    showPicker,
    setShowPicker,
    addCourse,
    removeCourse,
    maxCompare: MAX_COMPARE,
    addToCart,
  } as const;
}
