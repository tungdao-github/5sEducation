"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "@/figma/compat/router";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Mic,
  MicOff,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import CourseCard from "../components/CourseCard";
import { fetchCategories, fetchCourses, mapCourseList, type CategoryDto } from "../data/api";
import { useLanguage } from "../contexts/LanguageContext";
import type { Course } from "../contexts/CartContext";

const ITEMS_PER_PAGE = 20;

type PriceFilter = "all" | "free" | "under200" | "200-400" | "over400";
type DurationFilter = "all" | "under3h" | "3-6h" | "6-12h" | "over12h";
type LanguageFilter = "all" | "vietnamese" | "english";

const LEVELS = [
  { value: "all", label: "Tất cả" },
  { value: "Beginner", label: "Sơ cấp" },
  { value: "Intermediate", label: "Trung cấp" },
  { value: "Advanced", label: "Nâng cao" },
  { value: "All Levels", label: "Phù hợp mọi trình độ" },
  { value: "All levels", label: "Phù hợp mọi trình độ" },
] as const;

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, language } = useLanguage();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get("level") || "all");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>("all");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("popular");
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

    const sortMap: Record<string, string> = {
      popular: "popular",
      rating: "rating",
      newest: "newest",
      priceAsc: "price_asc",
      priceDesc: "price_desc",
    };

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
        if (active) {
          setCourses(dtos.map((dto) => mapCourseList(dto, language)));
        }
      })
      .catch((err) => {
        console.error("Failed to load courses", err);
        if (active) {
          setCourses([]);
          setError("Không thể tải khóa học. Vui lòng thử lại.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [query, selectedCategory, selectedLevel, priceFilter, minRating, sortBy, language]);

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
      const matchCategory =
        selectedCategory === "all" || course.categorySlug === selectedCategory || course.category === selectedCategory;
      const matchLevel = selectedLevel === "all" || course.level === selectedLevel;
      const matchPrice =
        priceFilter === "all" ||
        (priceFilter === "free" && course.price === 0) ||
        (priceFilter === "under200" && course.price > 0 && course.price < 200000) ||
        (priceFilter === "200-400" && course.price >= 200000 && course.price < 400000) ||
        (priceFilter === "over400" && course.price >= 400000);
      const matchLanguage =
        languageFilter === "all" ||
        (languageFilter === "english" ? course.language === "English" : course.language !== "English");
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
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Trình duyệt không hỗ trợ");
      return;
    }
    const recognition = new SR();
    recognition.lang = "vi-VN";
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
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

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50">
      <section className="border-b border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <Sparkles className="size-3.5" />
                Tìm kiếm khóa học
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-gray-950 sm:text-4xl">
                Khám phá khóa học phù hợp
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
                Lọc theo danh mục, trình độ, mức giá và đánh giá để tìm nhanh khóa học phù hợp nhất.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <span className="rounded-full bg-gray-100 px-3 py-1.5 font-medium">{sorted.length} kết quả</span>
              <span className="rounded-full bg-gray-100 px-3 py-1.5 font-medium">{categories.length + 1} danh mục</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex flex-1 items-center overflow-hidden rounded-xl border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-blue-500">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(event) => {
                  const value = event.target.value;
                  setQuery(value);
                  setSearchParams(value ? { q: value } : {});
                }}
                placeholder={t("home", "searchPlaceholder")}
                className="w-full bg-transparent py-3 pl-11 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
              {query ? (
                <button
                  onClick={() => {
                    setQuery("");
                    setSearchParams({});
                  }}
                  className="absolute right-1.5 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>

            <button
              onClick={handleVoiceSearch}
              className={`inline-flex items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                isListening
                  ? "border-red-300 bg-red-50 text-red-600"
                  : "border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {isListening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
            </button>

            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                showFilters
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:border-blue-400"
              }`}
            >
              <SlidersHorizontal className="size-5" />
              <span className="hidden sm:inline">Lọc</span>
              {hasFilters ? <span className="size-2 rounded-full bg-red-500" /> : null}
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {showFilters ? (
            <aside className="hidden w-64 flex-shrink-0 sm:block">
              <div className="sticky top-20 rounded-xl border border-gray-200 bg-white p-5">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Bộ lọc nâng cao</h3>
                  {hasFilters ? (
                    <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline">
                      Xóa tất cả
                    </button>
                  ) : null}
                </div>

                <FilterGroup title="Danh mục">
                  {[{ title: "Tất cả", slug: "all" }, ...categories].map((category) => (
                    <Choice
                      key={category.slug}
                      checked={selectedCategory === category.slug}
                      onChange={() => setSelectedCategory(category.slug)}
                      label={category.title}
                      name="category"
                    />
                  ))}
                </FilterGroup>

                <FilterGroup title="Trình độ">
                  {LEVELS.map((level) => (
                    <Choice
                      key={level.value}
                      checked={selectedLevel === level.value}
                      onChange={() => setSelectedLevel(level.value)}
                      label={level.label}
                      name="level"
                    />
                  ))}
                </FilterGroup>

                <FilterGroup title="Mức giá">
                  {[
                    { value: "all", label: "Tất cả" },
                    { value: "free", label: "Miễn phí" },
                    { value: "under200", label: "Dưới 200Kđ" },
                    { value: "200-400", label: "200Kđ - 400Kđ" },
                    { value: "over400", label: "Trên 400Kđ" },
                  ].map((item) => (
                    <Choice
                      key={item.value}
                      checked={priceFilter === item.value}
                      onChange={() => setPriceFilter(item.value as PriceFilter)}
                      label={item.label}
                      name="price"
                    />
                  ))}
                </FilterGroup>

                <FilterGroup title="Thời lượng">
                  {[
                    { value: "all", label: "Tất cả" },
                    { value: "under3h", label: "Dưới 3 giờ" },
                    { value: "3-6h", label: "3-6 giờ" },
                    { value: "6-12h", label: "6-12 giờ" },
                    { value: "over12h", label: "Trên 12 giờ" },
                  ].map((item) => (
                    <Choice
                      key={item.value}
                      checked={durationFilter === item.value}
                      onChange={() => setDurationFilter(item.value as DurationFilter)}
                      label={item.label}
                      name="duration"
                    />
                  ))}
                </FilterGroup>

                <FilterGroup title="Ngôn ngữ">
                  {[
                    { value: "all", label: "Tất cả" },
                    { value: "vietnamese", label: "Tiếng Việt" },
                    { value: "english", label: "Tiếng Anh" },
                  ].map((item) => (
                    <Choice
                      key={item.value}
                      checked={languageFilter === item.value}
                      onChange={() => setLanguageFilter(item.value as LanguageFilter)}
                      label={item.label}
                      name="language"
                    />
                  ))}
                </FilterGroup>

                <FilterGroup title="Đánh giá tối thiểu">
                  {[0, 4, 4.5, 4.8].map((rating) => (
                    <Choice
                      key={rating}
                      checked={minRating === rating}
                      onChange={() => setMinRating(rating)}
                      label={rating === 0 ? "Tất cả" : `${rating}★ trở lên`}
                      name="rating"
                    />
                  ))}
                </FilterGroup>
              </div>
            </aside>
          ) : null}

          <main className="min-w-0 flex-1 overflow-hidden">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-600">
                {query ? <span className="font-medium text-gray-950">“{query}” · </span> : null}
                Tìm thấy <span className="font-semibold text-gray-950">{sorted.length}</span> khóa học
              </p>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="popular">Phổ biến nhất</option>
                <option value="rating">Đánh giá cao nhất</option>
                <option value="newest">Mới nhất</option>
                <option value="priceAsc">Giá tăng dần</option>
                <option value="priceDesc">Giá giảm dần</option>
              </select>
            </div>

            {loading ? (
              <div className="rounded-xl border border-gray-200 bg-white py-20 text-center text-gray-500">
                Đang tải khóa học...
              </div>
            ) : error ? (
              <div className="rounded-xl border border-gray-200 bg-white py-20 text-center text-gray-500">
                {error}
              </div>
            ) : currentItems.length > 0 ? (
              <>
                <div className="mb-8 grid grid-cols-1 gap-5 justify-items-stretch sm:grid-cols-2 lg:grid-cols-3">
                  {currentItems.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>

                {totalPages > 1 ? (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Pager
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="size-4" />
                    </Pager>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => {
                        const show =
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1);

                        if (!show) {
                          if (page === currentPage - 2 || page === currentPage + 2) {
                            return (
                              <span key={page} className="px-2 text-gray-400">
                                ...
                              </span>
                            );
                          }
                          return null;
                        }

                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-[40px] rounded-lg px-3 py-2 text-sm transition-colors ${
                              currentPage === page
                                ? "bg-blue-600 text-white"
                                : "border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    <Pager
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="size-4" />
                    </Pager>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-16 text-center">
                <BookOpen className="mx-auto mb-4 size-14 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-700">Không tìm thấy kết quả</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để xem thêm khóa học.
                </p>
                {hasFilters ? (
                  <button onClick={clearFilters} className="mt-5 text-sm font-semibold text-blue-600 hover:underline">
                    Xóa tất cả bộ lọc
                  </button>
                ) : null}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function matchesDuration(duration: string, filter: DurationFilter) {
  const hours = Number.parseFloat(duration);
  if (Number.isNaN(hours)) return false;
  if (filter === "under3h") return hours < 3;
  if (filter === "3-6h") return hours >= 3 && hours < 6;
  if (filter === "6-12h") return hours >= 6 && hours < 12;
  if (filter === "over12h") return hours >= 12;
  return true;
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Choice({ checked, label, name, onChange }: { checked: boolean; label: string; name: string; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg px-1 py-1 text-sm text-gray-600 transition hover:text-gray-950">
      <input type="radio" checked={checked} name={name} onChange={onChange} className="size-4 accent-blue-600" />
      <span>{label}</span>
    </label>
  );
}

function Pager({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
