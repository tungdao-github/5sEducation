"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "@/lib/router";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Course } from "@/contexts/CartContext";
import { fetchCourses, mapCourseList } from "@/services/api";

export function useHomePage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    let active = true;
    fetchCourses({ pageSize: 24, sort: "popular" })
      .then((courseDtos) => {
        if (!active) return;
        setCourses(courseDtos.map((dto) => mapCourseList(dto, language)));
      })
      .catch(() => {
        if (!active) return;
        setCourses([]);
      });

    return () => {
      active = false;
    };
  }, [language]);

  const filteredCourses = useMemo(
    () =>
      courses.filter((course) => {
        const matchesCategory = selectedCategory === "all" || course.categorySlug === selectedCategory;
        const matchesSearch =
          searchQuery === "" ||
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      }),
    [courses, searchQuery, selectedCategory]
  );

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const featuredCourses = courses.slice(0, 3);
  const topRatedCourses = [...courses].sort((a, b) => b.rating - a.rating).slice(0, 3);

  return {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    courses,
    filteredCourses,
    handleSearch,
    featuredCourses,
    topRatedCourses,
  } as const;
}
