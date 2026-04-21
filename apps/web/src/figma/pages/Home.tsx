"use client";

import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "@/figma/compat/router";
import CourseCard from "../components/CourseCard";
import { fetchCourses, mapCourseList } from "../data/api";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Search,
  Play,
  Star,
  Users,
  BookOpen,
  Award,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Zap,
  Clock,
  CheckCircle2,
  TrendingUp,
  Shield,
  Sparkles,
  Target,
  BarChart3,
} from "lucide-react";
import type { Course } from "../contexts/CartContext";
import { cn } from "@/lib/utils";

// Data
const testimonials = [
  {
    name: "Nguyen Thi Mai",
    role: "UX Designer tai FPT Software",
    avatar: "M",
    rating: 5,
    text: "Khoa hoc Gestalt Principles da thay doi cach toi tiep can thiet ke. Toi ap dung ngay vao du an va nhan duoc phan hoi rat tich cuc tu khach hang!",
    company: "FPT Software",
  },
  {
    name: "Tran Van Hung",
    role: "Product Designer tai VNG",
    avatar: "H",
    rating: 5,
    text: "Noi dung chat luong cao, giang vien co kinh nghiem thuc te. Sau 3 thang hoc, toi da dat duoc vi tri Senior UX Designer.",
    company: "VNG",
  },
  {
    name: "Le Thi Hoa",
    role: "Freelance UX Writer",
    avatar: "H",
    rating: 5,
    text: "Khoa Microcopy la mot game-changer! Toi da tang duoc ty le chuyen doi cua khach hang len 40% chi bang cach viet lai button va form labels.",
    company: "Freelance",
  },
  {
    name: "Pham Minh Duc",
    role: "UI Designer tai Grab Vietnam",
    avatar: "D",
    rating: 5,
    text: "EduCourse la nen tang hoc UX/UI tot nhat toi tung dung. Noi dung cap nhat lien tuc, cong dong hoc vien rat supportive.",
    company: "Grab",
  },
];

const instructors = [
  {
    name: "Tanner Kohler",
    title: "UX Design Specialist",
    courses: 3,
    students: 8500,
    rating: 4.9,
    avatar: "T",
  },
  {
    name: "Kate Moran",
    title: "UX Writer & Researcher",
    courses: 2,
    students: 6200,
    rating: 4.9,
    avatar: "K",
  },
  {
    name: "Jakob Nielsen",
    title: "Usability Expert",
    courses: 1,
    students: 5432,
    rating: 4.9,
    avatar: "J",
  },
  {
    name: "Sarah Gibbons",
    title: "UX Strategy Lead",
    courses: 1,
    students: 2234,
    rating: 4.8,
    avatar: "S",
  },
];

const learningPaths = [
  {
    title: "UX Designer tu Zero",
    duration: "6 thang",
    courses: 4,
    level: "So cap - Trung cap",
    desc: "Lo trinh toan dien tu co ban den thanh thao UX Design",
    badge: "Pho bien nhat",
    icon: Target,
  },
  {
    title: "UX Writer Chuyen nghiep",
    duration: "3 thang",
    courses: 2,
    level: "Trung cap",
    desc: "Viet microcopy va noi dung UX hieu qua cho san pham so",
    badge: "Moi",
    icon: Sparkles,
  },
  {
    title: "UX Research Master",
    duration: "4 thang",
    courses: 3,
    level: "Trung cap - Nang cao",
    desc: "Thanh thao nghien cuu nguoi dung va phan tich du lieu",
    badge: "",
    icon: BarChart3,
  },
];

const features = [
  {
    icon: Target,
    title: "Hoc thuc chien",
    desc: "Noi dung duoc thiet ke tu du an thuc te, ap dung ngay vao cong viec",
  },
  {
    icon: Clock,
    title: "Truy cap tron doi",
    desc: "Mua mot lan, hoc mai mai. Cap nhat noi dung moi mien phi",
  },
  {
    icon: Award,
    title: "Chung chi co gia tri",
    desc: "Chung chi duoc cong nhan boi hon 200 cong ty trong nganh",
  },
  {
    icon: Shield,
    title: "Ho tro 24/7",
    desc: "Doi ngu ho tro luon san sang giai dap moi thac mac cua ban",
  },
  {
    icon: CheckCircle2,
    title: "Hoan tien 30 ngay",
    desc: "Khong hai long? Hoan lai 100% hoc phi trong vong 30 ngay",
  },
  {
    icon: Zap,
    title: "Hoc moi thiet bi",
    desc: "Xem tren laptop, tablet hay dien thoai theo lich cua ban",
  },
];

// Hero Section Component
function HeroSection({
  searchQuery,
  setSearchQuery,
  onSearch,
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
}) {
  return (
    <section className="relative bg-gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm-30 30v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container-main relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center py-16 md:py-24 lg:py-32">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-6">
              <Zap className="size-4" />
              <span>Hon 50,000 hoc vien dang hoc</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Lam chu{" "}
              <span className="text-accent">UX/UI Design</span>
              <br />
              tu hom nay
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              Hoc tu nhung chuyen gia hang dau the gioi. Noi dung thuc chien, 
              chung chi co gia tri, hoc moi luc moi noi.
            </p>

            {/* Search Form */}
            <form onSubmit={onSearch} className="flex gap-3 max-w-lg mx-auto lg:mx-0 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tim kiem khoa hoc, giang vien..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-lg pl-12 w-full"
                />
              </div>
              <button type="submit" className="btn btn-accent btn-lg">
                Tim ngay
              </button>
            </form>

            {/* Quick Tags */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-sm">
              <span className="text-muted-foreground">Xu huong:</span>
              <Link to="/search?q=gestalt" className="px-3 py-1.5 bg-secondary rounded-full hover:bg-muted transition-colors">
                Gestalt Principles
              </Link>
              <Link to="/search?q=microcopy" className="px-3 py-1.5 bg-secondary rounded-full hover:bg-muted transition-colors">
                Microcopy
              </Link>
              <Link to="/search?q=analytics" className="px-3 py-1.5 bg-secondary rounded-full hover:bg-muted transition-colors">
                UX Analytics
              </Link>
            </div>
          </div>

          {/* Right Content - Stats Cards */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Main Card */}
              <div className="card card-elevated p-8 bg-card">
                <div className="flex items-center gap-4 mb-6">
                  <div className="size-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <Play className="size-8 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Bat dau hoc ngay</h3>
                    <p className="text-muted-foreground">200+ khoa hoc chat luong</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary rounded-xl">
                    <div className="text-3xl font-bold text-accent mb-1">98%</div>
                    <div className="text-sm text-muted-foreground">Ty le hai long</div>
                  </div>
                  <div className="p-4 bg-secondary rounded-xl">
                    <div className="text-3xl font-bold text-foreground mb-1">50K+</div>
                    <div className="text-sm text-muted-foreground">Hoc vien</div>
                  </div>
                  <div className="p-4 bg-secondary rounded-xl">
                    <div className="text-3xl font-bold text-foreground mb-1">4.9</div>
                    <div className="text-sm text-muted-foreground">Danh gia trung binh</div>
                  </div>
                  <div className="p-4 bg-secondary rounded-xl">
                    <div className="text-3xl font-bold text-foreground mb-1">50+</div>
                    <div className="text-sm text-muted-foreground">Giang vien</div>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 px-4 py-2 bg-accent text-accent-foreground rounded-full font-semibold shadow-lg animate-pulse">
                Giam 30% hom nay
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Featured Courses Section
function FeaturedCoursesSection({ courses }: { courses: Course[] }) {
  return (
    <section className="section bg-background">
      <div className="container-main">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Khoa hoc noi bat
            </h2>
            <p className="text-muted-foreground text-lg">
              Nhung khoa hoc duoc danh gia cao nhat tu hoc vien
            </p>
          </div>
          <Link
            to="/courses"
            className="btn btn-outline btn-md group"
          >
            Xem tat ca
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.slice(0, 8).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Learning Paths Section
function LearningPathsSection() {
  return (
    <section className="section bg-muted">
      <div className="container-main">
        <div className="section-header">
          <h2 className="section-title">Lo trinh hoc tap</h2>
          <p className="section-subtitle">
            Hoc theo lo trinh de dat muc tieu nhanh nhat
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {learningPaths.map((path) => (
            <div
              key={path.title}
              className="card card-elevated p-6 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              {path.badge && (
                <span className="badge badge-accent mb-4">{path.badge}</span>
              )}

              <div className="size-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
                <path.icon className="size-7 text-accent" />
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2">
                {path.title}
              </h3>
              <p className="text-muted-foreground mb-5">{path.desc}</p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="size-4" />
                  {path.courses} khoa hoc
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4" />
                  {path.duration}
                </span>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-border">
                <span className="text-sm font-medium text-muted-foreground">
                  {path.level}
                </span>
                <Link
                  to="/paths"
                  className="text-accent font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                >
                  Bat dau
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Instructors Section
function InstructorsSection() {
  return (
    <section className="section bg-background">
      <div className="container-main">
        <div className="section-header">
          <h2 className="section-title">Giang vien hang dau</h2>
          <p className="section-subtitle">
            Hoc tu nhung chuyen gia UX/UI Design voi kinh nghiem thuc chien
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {instructors.map((instructor) => (
            <div
              key={instructor.name}
              className="card card-elevated p-6 text-center hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              <div className="size-20 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground group-hover:scale-105 transition-transform">
                {instructor.avatar}
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">
                {instructor.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {instructor.title}
              </p>
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <BookOpen className="size-4" />
                  {instructor.courses}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Users className="size-4" />
                  {(instructor.students / 1000).toFixed(1)}K
                </span>
                <span className="flex items-center gap-1">
                  <Star className="size-4 star-filled" />
                  {instructor.rating}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials Section
function TestimonialsSection() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((c) => (c + 1) % testimonials.length);
  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="section bg-primary text-primary-foreground">
      <div className="container-main">
        <div className="section-header">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Hoc vien noi gi ve chung toi
          </h2>
          <p className="text-lg text-primary-foreground/70">
            Hon 50,000 hoc vien da tin tuong EduCourse
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="card bg-white/10 backdrop-blur-sm border-white/10 p-8 md:p-10 text-center">
            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                <Star key={i} className="size-5 star-filled" />
              ))}
            </div>

            {/* Quote */}
            <blockquote className="text-xl md:text-2xl font-medium mb-8 leading-relaxed">
              &ldquo;{testimonials[current].text}&rdquo;
            </blockquote>

            {/* Author */}
            <div className="flex items-center justify-center gap-4">
              <div className="size-14 rounded-full bg-accent flex items-center justify-center text-xl font-bold text-accent-foreground">
                {testimonials[current].avatar}
              </div>
              <div className="text-left">
                <p className="font-semibold">{testimonials[current].name}</p>
                <p className="text-sm text-primary-foreground/70">
                  {testimonials[current].role}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="size-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="size-5" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === current ? "w-8 bg-accent" : "w-2 bg-white/30"
                  )}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="size-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Features Section
function FeaturesSection() {
  return (
    <section className="section bg-muted">
      <div className="container-main">
        <div className="section-header">
          <h2 className="section-title">Tai sao chon EduCourse?</h2>
          <p className="section-subtitle">
            Chung toi cam ket mang lai trai nghiem hoc tot nhat
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex gap-5 p-6 rounded-2xl bg-card hover:shadow-lg transition-shadow"
            >
              <div className="size-14 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="size-7 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section className="section bg-background">
      <div className="container-main">
        <div className="card gradient-accent p-10 md:p-16 text-center text-accent-foreground">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            San sang bat dau hanh trinh hoc tap?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Tham gia cung 50,000+ hoc vien va bat dau hoc cac khoa hoc chat luong cao ngay hom nay.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/courses" className="btn bg-white text-primary hover:bg-white/90 btn-lg">
              Kham pha khoa hoc
              <ArrowRight className="size-5" />
            </Link>
            <Link to="/paths" className="btn btn-outline border-white/30 text-white hover:bg-white/10 btn-lg">
              Xem lo trinh
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// Main Home Component
export default function Home() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    fetchCourses({ pageSize: 24, sort: "popular" })
      .then((courseDtos) => {
        if (!active) return;
        setCourses(courseDtos.map((dto) => mapCourseList(dto, language)));
      })
      .catch((error) => {
        console.error("Failed to load homepage courses", error);
        if (!active) return;
        setCourses([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [language]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
      />
      <FeaturedCoursesSection courses={courses} />
      <LearningPathsSection />
      <InstructorsSection />
      <TestimonialsSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
}
