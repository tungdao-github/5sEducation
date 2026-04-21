"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "@/figma/compat/router";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid3X3,
  List,
  Mic,
  MicOff,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import CourseCard from "../components/CourseCard";
import { fetchCategories, fetchCourses, mapCourseList, type CategoryDto } from "../data/api";
import { useLanguage } from "../contexts/LanguageContext";
import type { Course } from "../contexts/CartContext";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 12;

type PriceFilter = "all" | "free" | "under200" | "200-400" | "over400";
type DurationFilter = "all" | "under3h" | "3-6h" | "6-12h" | "over12h";

const LEVELS = [
  { value: "all", label: "Tat ca" },
  { value: "Beginner", label: "So cap" },
  { value: "Intermediate", label: "Trung cap" },
  { value: "Advanced", label: "Nang cao" },
  { value: "All Levels", label: "Phu hop moi trinh do" },
] as const;

const PRICE_OPTIONS = [
  { value: "all", label: "Tat ca" },
  { value: "free", label: "Mien phi" },
  { value: "under200", label: "Duoi 200K" },
  { value: "200-400", label: "200K - 400K" },
  { value: "over400", label: "Tren 400K" },
] as const;

const SORT_OPTIONS = [
  { value: "popular", label: "Pho bien nhat" },
  { value: "rating", label: "Danh gia cao nhat" },
  { value: "newest", label: "Moi nhat" },
  { value: "priceAsc", label: "Gia tang dan" },
  { value: "priceDesc", label: "Gia giam dan" },
] as const;

function matchesDuration(duration: string, filter: DurationFilter): boolean {
  const hours = Number.parseFloat(duration) || 0;
  switch (filter) {
    case "under3h":
      return hours < 3;
    case "3-6h":
      return hours >= 3 && hours < 6;
    case "6-12h":
      return hours >= 6 && hours < 12;
    case "over12h":
      return hours >= 12;
    default:
      return true;
  }
}

// Filter Checkbox Component
function FilterCheckbox({
  checked,
  onChange,
  label,
  count,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: number;
}) {
  return (
    <label className="flex items-center gap-3 py-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 rounded border-border text-accent focus:ring-accent"
      />
      <span
        className={cn(
          "text-sm transition-colors",
          checked ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground"
        )}
      >
        {label}
      </span>
      {count !== undefined && (
        <span className="ml-auto text-xs text-muted-foreground">({count})</span>
      )}
    </label>
  );
}

// Filter Section Component
function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left mb-3"
      >
        <h4 className="font-semibold text-foreground">{title}</h4>
        <ChevronRight
          className={cn("size-4 text-muted-foreground transition-transform", isOpen && "rotate-90")}
        />
      </button>
      {isOpen && <div className="space-y-1">{children}</div>}
    </div>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { language } = useLanguage();
  
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get("level") || "all");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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
      .then((data) => active && setCategories(data))
      .catch(() => active && setCategories([]));
    return () => { active = false; };
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
      minRating: minRating > 0 ? minRating : undefined,
      sort: sortMap[sortBy] ?? "popular",
      pageSize: 48,
    })
      .then((dtos) => {
        if (active) setCourses(dtos.map((dto) => mapCourseList(dto, language)));
      })
      .catch((err) => {
        console.error("Failed to load courses", err);
        if (active) {
          setCourses([]);
          setError("Khong the tai khoa hoc. Vui long thu lai.");
        }
      })
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [query, selectedCategory, selectedLevel, minRating, sortBy, language]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, selectedCategory, selectedLevel, priceFilter, durationFilter, minRating, sortBy]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((course) => {
      const matchQ = !q ||
        course.title.toLowerCase().includes(q) ||
        course.instructor.toLowerCase().includes(q) ||
        course.category.toLowerCase().includes(q);
      const matchCategory = selectedCategory === "all" || 
        course.categorySlug === selectedCategory || 
        course.category === selectedCategory;
      const matchLevel = selectedLevel === "all" || course.level === selectedLevel;
      const matchPrice = priceFilter === "all" ||
        (priceFilter === "free" && course.price === 0) ||
        (priceFilter === "under200" && course.price > 0 && course.price < 200) ||
        (priceFilter === "200-400" && course.price >= 200 && course.price < 400) ||
        (priceFilter === "over400" && course.price >= 400);
      const matchRating = course.rating >= minRating;
      const matchDuration = durationFilter === "all" || matchesDuration(course.duration, durationFilter);
      return matchQ && matchCategory && matchLevel && matchPrice && matchRating && matchDuration;
    });
  }, [courses, durationFilter, minRating, priceFilter, query, selectedCategory, selectedLevel]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sortBy) {
      case "priceAsc": return list.sort((a, b) => a.price - b.price);
      case "priceDesc": return list.sort((a, b) => b.price - a.price);
      case "rating": return list.sort((a, b) => b.rating - a.rating);
      case "newest": return list.sort((a, b) => Number.parseInt(b.id, 10) - Number.parseInt(a.id, 10));
      default: return list.sort((a, b) => b.students - a.students);
    }
  }, [filtered, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const currentItems = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  
  const hasFilters = selectedCategory !== "all" || selectedLevel !== "all" || 
    priceFilter !== "all" || durationFilter !== "all" || minRating > 0;

  const handleVoiceSearch = () => {
    const SR = (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition || 
      (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) {
      alert("Trinh duyet khong ho tro");
      return;
    }
    const recognition = new SR();
    recognition.lang = "vi-VN";
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
    setMinRating(0);
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <section className="bg-card border-b border-border">
        <div className="container-main py-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Kham pha khoa hoc</h1>
          <p className="text-muted-foreground">
            Tim kiem va loc de tim khoa hoc phu hop voi ban
          </p>
        </div>
      </section>

      {/* Search Bar */}
      <section className="bg-card border-b border-border sticky top-16 z-40">
        <div className="container-main py-4">
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchParams(e.target.value ? { q: e.target.value } : {});
                }}
                placeholder="Tim kiem khoa hoc, giang vien..."
                className="input pl-12 pr-12"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setSearchParams({});
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Voice Search */}
            <button
              onClick={handleVoiceSearch}
              className={cn(
                "btn btn-icon",
                isListening ? "bg-destructive text-destructive-foreground" : "btn-secondary"
              )}
            >
              {isListening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
            </button>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "btn gap-2 hidden md:flex",
                showFilters ? "btn-primary" : "btn-secondary"
              )}
            >
              <SlidersHorizontal className="size-4" />
              Bo loc
              {hasFilters && <span className="size-2 rounded-full bg-accent" />}
            </button>

            {/* View Mode */}
            <div className="hidden sm:flex items-center border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2.5 transition-colors",
                  viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"
                )}
              >
                <Grid3X3 className="size-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2.5 transition-colors",
                  viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"
                )}
              >
                <List className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-main py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          {showFilters && (
            <aside className="hidden md:block w-72 flex-shrink-0">
              <div className="sticky top-36 bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <Filter className="size-4" />
                    Bo loc
                  </h3>
                  {hasFilters && (
                    <button onClick={clearFilters} className="text-sm text-accent hover:underline">
                      Xoa tat ca
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <FilterSection title="Danh muc">
                  <FilterCheckbox
                    checked={selectedCategory === "all"}
                    onChange={() => setSelectedCategory("all")}
                    label="Tat ca danh muc"
                  />
                  {categories.map((cat) => (
                    <FilterCheckbox
                      key={cat.slug}
                      checked={selectedCategory === cat.slug}
                      onChange={() => setSelectedCategory(cat.slug)}
                      label={cat.title}
                    />
                  ))}
                </FilterSection>

                {/* Level Filter */}
                <FilterSection title="Trinh do">
                  {LEVELS.map((level) => (
                    <FilterCheckbox
                      key={level.value}
                      checked={selectedLevel === level.value}
                      onChange={() => setSelectedLevel(level.value)}
                      label={level.label}
                    />
                  ))}
                </FilterSection>

                {/* Price Filter */}
                <FilterSection title="Muc gia">
                  {PRICE_OPTIONS.map((option) => (
                    <FilterCheckbox
                      key={option.value}
                      checked={priceFilter === option.value}
                      onChange={() => setPriceFilter(option.value as PriceFilter)}
                      label={option.label}
                    />
                  ))}
                </FilterSection>

                {/* Rating Filter */}
                <FilterSection title="Danh gia">
                  {[0, 4, 4.5, 4.8].map((rating) => (
                    <FilterCheckbox
                      key={rating}
                      checked={minRating === rating}
                      onChange={() => setMinRating(rating)}
                      label={rating === 0 ? "Tat ca" : `${rating} sao tro len`}
                    />
                  ))}
                </FilterSection>
              </div>
            </aside>
          )}

          {/* Course Grid */}
          <main className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <p className="text-muted-foreground">
                {query && <span className="font-semibold text-foreground">&ldquo;{query}&rdquo; - </span>}
                Tim thay <span className="font-semibold text-foreground">{sorted.length}</span> khoa hoc
              </p>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input w-auto"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Loading */}
            {loading && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="aspect-video bg-muted" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-5 bg-muted rounded w-full" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="card p-12 text-center">
                <p className="text-muted-foreground">{error}</p>
              </div>
            )}

            {/* Results */}
            {!loading && !error && currentItems.length > 0 && (
              <>
                <div
                  className={cn(
                    "gap-6",
                    viewMode === "grid"
                      ? "grid sm:grid-cols-2 lg:grid-cols-3"
                      : "flex flex-col"
                  )}
                >
                  {currentItems.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      variant={viewMode === "list" ? "horizontal" : "default"}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="btn btn-secondary btn-sm"
                    >
                      <ChevronLeft className="size-4" />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => 
                          page === 1 || page === totalPages || 
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        )
                        .map((page, idx, arr) => (
                          <div key={page} className="flex items-center">
                            {idx > 0 && arr[idx - 1] !== page - 1 && (
                              <span className="px-2 text-muted-foreground">...</span>
                            )}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={cn(
                                "btn btn-sm min-w-[40px]",
                                currentPage === page ? "btn-primary" : "btn-secondary"
                              )}
                            >
                              {page}
                            </button>
                          </div>
                        ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="btn btn-secondary btn-sm"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                )}
              </>
            )}

            {/* No Results */}
            {!loading && !error && currentItems.length === 0 && (
              <div className="card p-12 text-center">
                <div className="size-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Search className="size-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Khong tim thay khoa hoc</h3>
                <p className="text-muted-foreground mb-6">
                  Thu thay doi tu khoa tim kiem hoac dieu chinh bo loc
                </p>
                <button onClick={clearFilters} className="btn btn-primary">
                  Xoa bo loc
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
