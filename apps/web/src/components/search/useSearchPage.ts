"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "@/lib/router";
import { useI18n } from "@/app/providers";
import { fetchCategories, fetchCourses, mapCourseList, type CategoryDto } from "@/services/api";
import type { Course } from "@/contexts/CartContext";
import type { DurationFilter, LanguageFilter, PriceFilter } from "@/components/search/SearchFilterSidebar";

export type SortMode = "popular" | "rating" | "newest" | "priceAsc" | "priceDesc";

type SpeechRecognitionResultLike = {
  transcript: string;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>;
};

type SpeechRecognitionConstructor = new () => {
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
};

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

const ITEMS_PER_PAGE = 20;

const sortMap: Record<SortMode, string> = {
  popular: "popular",
  rating: "rating",
  newest: "newest",
  priceAsc: "price_asc",
  priceDesc: "price_desc",
};

export function useSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, locale, tx } = useI18n();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get("level") || "all");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>("all");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<SortMode>("popular");
  const [showFilters, setShowFilters] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    fetchCategories()
      .then((data) => {
        if (active) setCategories(data);
      })
      .catch(() => {
        if (active) setCategories([]);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetchCourses({
      search: query || undefined,
      category: selectedCategory === "all" ? undefined : selectedCategory,
      level: selectedLevel === "all" ? undefined : selectedLevel,
      minPrice:
        priceFilter === "free"
          ? 0
          : priceFilter === "under200"
            ? 1
            : priceFilter === "200-400"
              ? 200000
              : priceFilter === "over400"
                ? 400000
                : undefined,
      maxPrice:
        priceFilter === "free"
          ? 0
          : priceFilter === "under200"
            ? 199999
            : priceFilter === "200-400"
              ? 399999
              : undefined,
      minRating: minRating > 0 ? minRating : undefined,
      sort: sortMap[sortBy] ?? "popular",
      pageSize: 48,
    })
      .then((dtos) => {
        if (active) setCourses(dtos.map((dto) => mapCourseList(dto, locale)));
      })
      .catch((err) => {
        console.error("Failed to load courses", err);
        if (active) {
          setCourses([]);
          setError(tx("Failed to load courses. Please try again.", "Không thể tải khóa học. Vui lòng thử lại."));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [query, selectedCategory, selectedLevel, priceFilter, minRating, sortBy, locale, tx]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, selectedCategory, selectedLevel, priceFilter, durationFilter, languageFilter, minRating, sortBy]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((course) => {
      const matchQ =
        !q ||
        course.title.toLowerCase().includes(q) ||
        course.instructor.toLowerCase().includes(q) ||
        course.description.toLowerCase().includes(q) ||
        course.category.toLowerCase().includes(q);
      const matchCategory = selectedCategory === "all" || course.categorySlug === selectedCategory || course.category === selectedCategory;
      const matchLevel = selectedLevel === "all" || course.level === selectedLevel;
      const matchPrice =
        priceFilter === "all" ||
        (priceFilter === "free" && course.price === 0) ||
        (priceFilter === "under200" && course.price > 0 && course.price < 200000) ||
        (priceFilter === "200-400" && course.price >= 200000 && course.price < 400000) ||
        (priceFilter === "over400" && course.price >= 400000);
      const matchLanguage = languageFilter === "all" || (languageFilter === "english" ? course.language === "English" : course.language !== "English");
      const matchRating = course.rating >= minRating;
      const matchDuration = durationFilter === "all" || matchesDuration(course.duration, durationFilter);
      return matchQ && matchCategory && matchLevel && matchPrice && matchLanguage && matchRating && matchDuration;
    });
  }, [courses, durationFilter, languageFilter, minRating, priceFilter, query, selectedCategory, selectedLevel]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sortBy) {
      case "priceAsc":
        return list.sort((a, b) => a.price - b.price);
      case "priceDesc":
        return list.sort((a, b) => b.price - a.price);
      case "rating":
        return list.sort((a, b) => b.rating - a.rating);
      case "newest":
        return list.sort((a, b) => Number.parseInt(b.id, 10) - Number.parseInt(a.id, 10));
      default:
        return list.sort((a, b) => b.students - a.students);
    }
  }, [filtered, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const currentItems = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const hasFilters =
    selectedCategory !== "all" ||
    selectedLevel !== "all" ||
    priceFilter !== "all" ||
    durationFilter !== "all" ||
    languageFilter !== "all" ||
    minRating > 0;

  const handleVoiceSearch = () => {
    const speechWindow = window as SpeechWindow;
    const SR = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SR) {
      alert(tx("Your browser does not support speech search.", "Trình duyệt không hỗ trợ tìm kiếm bằng giọng nói."));
      return;
    }

    const recognition = new SR();
    recognition.lang = locale === "vi" ? "vi-VN" : "en-US";
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setSearchParams(transcript ? { q: transcript } : {});
    };
    recognition.start();
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedLevel("all");
    setPriceFilter("all");
    setDurationFilter("all");
    setLanguageFilter("all");
    setMinRating(0);
    setSortBy("popular");
  };

  return {
    t,
    query,
    setQuery,
    setSearchParams,
    selectedCategory,
    setSelectedCategory,
    selectedLevel,
    setSelectedLevel,
    priceFilter,
    setPriceFilter,
    durationFilter,
    setDurationFilter,
    languageFilter,
    setLanguageFilter,
    minRating,
    setMinRating,
    sortBy,
    setSortBy,
    showFilters,
    setShowFilters,
    isListening,
    currentPage,
    setCurrentPage,
    categories,
    loading,
    error,
    currentItems,
    totalPages,
    hasFilters,
    handleVoiceSearch,
    clearFilters,
  } as const;
}

function matchesDuration(duration: string, filter: DurationFilter) {
  const totalMinutes = parseDurationToMinutes(duration);
  switch (filter) {
    case "under3h":
      return totalMinutes > 0 && totalMinutes <= 180;
    case "3-6h":
      return totalMinutes > 180 && totalMinutes <= 360;
    case "6-12h":
      return totalMinutes > 360 && totalMinutes <= 720;
    case "over12h":
      return totalMinutes > 720;
    case "all":
      return true;
    default:
      return true;
  }
}

function parseDurationToMinutes(duration: string) {
  const match = duration.match(/(\d+(?:[.,]\d+)?)\s*(h|hour|hours|giờ|phút|mins?|minutes?)/i);
  if (!match) return 0;
  const value = Number.parseFloat(match[1].replace(",", "."));
  const unit = match[2].toLowerCase();
  if (unit.startsWith("h") || unit.includes("giờ")) {
    return Math.round(value * 60);
  }
  return Math.round(value);
}
