"use client";

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@/figma/compat/router";
import CourseCard from "../components/CourseCard";
import { fetchCourses, mapCourseList, formatPriceCompact } from "../data/api";
import { useLanguage } from "../contexts/LanguageContext";
import { Search, Zap, Star, Users, BookOpen, Award, ArrowRight, Play, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import type { Course } from "../contexts/CartContext";

const testimonials = [
  {
    name: "Nguyễn Thị Mai",
    role: "UX Designer tại FPT Software",
    avatar: "M",
    rating: 5,
    text: "Khóa học Gestalt Principles đã thay đổi cách tôi tiếp cận thiết kế. Tôi áp dụng ngay vào dự án và nhận được phản hồi rất tích cực từ khách hàng!",
  },
  {
    name: "Trần Văn Hùng",
    role: "Product Designer tại VNG",
    avatar: "H",
    rating: 5,
    text: "Nội dung chất lượng cao, giảng viên có kinh nghiệm thực tế. Sau 3 tháng học, tôi đã đạt được vị trí Senior UX Designer mà không cần bằng cấp.",
  },
  {
    name: "Lê Thị Hoa",
    role: "Freelance UX Writer",
    avatar: "H",
    rating: 5,
    text: "Khóa Microcopy là một game-changer! Tôi đã tăng được tỷ lệ chuyển đổi của khách hàng lên 40% chỉ bằng cách viết lại button và form labels.",
  },
  {
    name: "Phạm Minh Đức",
    role: "UI Designer tại Grab Vietnam",
    avatar: "Đ",
    rating: 5,
    text: "EduCourse là nền tảng học UX/UI tốt nhất tôi từng dùng. Nội dung cập nhật liên tục, cộng đồng học viên rất supportive và nhiệt tình.",
  },
];

const instructors = [
  { name: "Tanner Kohler", title: "UX Design Specialist", courses: 3, students: 8500, rating: 4.9, avatar: "T", color: "from-blue-500 to-indigo-500" },
  { name: "Kate Moran", title: "UX Writer & Researcher", courses: 2, students: 6200, rating: 4.9, avatar: "K", color: "from-purple-500 to-pink-500" },
  { name: "Jakob Nielsen", title: "Usability Expert", courses: 1, students: 5432, rating: 4.9, avatar: "J", color: "from-green-500 to-teal-500" },
  { name: "Sarah Gibbons", title: "UX Strategy Lead", courses: 1, students: 2234, rating: 4.8, avatar: "S", color: "from-orange-500 to-red-500" },
];

const learningPaths = [
  {
    title: "UX Designer từ Zero",
    icon: "🎨",
    duration: "6 tháng",
    courses: 4,
    level: "Sơ cấp → Trung cấp",
    desc: "Lộ trình toàn diện từ cơ bản đến thành thạo UX Design",
    color: "border-blue-200 bg-blue-50",
    badge: "Phổ biến nhất",
  },
  {
    title: "UX Writer Chuyên nghiệp",
    icon: "✍️",
    duration: "3 tháng",
    courses: 2,
    level: "Trung cấp",
    desc: "Viết microcopy và nội dung UX hiệu quả cho sản phẩm số",
    color: "border-purple-200 bg-purple-50",
    badge: "Mới",
  },
  {
    title: "UX Research Master",
    icon: "🔬",
    duration: "4 tháng",
    courses: 3,
    level: "Trung cấp → Nâng cao",
    desc: "Thành thạo nghiên cứu người dùng và phân tích dữ liệu",
    color: "border-green-200 bg-green-50",
    badge: "",
  },
];

const categories = [
  "Tất cả",
  "Thiết kế UX/UI",
  "Nghiên cứu UX",
  "Viết nội dung UX",
  "Quản lý UX",
  "Phân tích UX",
];

function FlashSaleCountdown({ courses }: { courses: Course[] }) {
  const endTime = useRef(Date.now() + 8 * 3600 * 1000 + 23 * 60 * 1000 + 45 * 1000);
  const [timeLeft, setTimeLeft] = useState({ h: 8, m: 23, s: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.max(0, endTime.current - Date.now());
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (value: number) => String(value).padStart(2, "0");
  const flashCourses = courses.filter((course) => course.originalPrice && course.originalPrice > course.price).slice(0, 4);

  return (
    <section style={{backgroundColor: "blue"}}className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/20">
              <Zap className="size-6 fill-white text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Flash Sale</h2>
              <p className="text-sm text-red-100">Ưu đãi đặc biệt - Giảm đến 30%</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-white">Kết thúc sau:</span>
            <div className="flex items-center gap-1.5">
              {[
                { label: "GIỜ", value: pad(timeLeft.h) },
                { label: "PHÚT", value: pad(timeLeft.m) },
                { label: "GIÂY", value: pad(timeLeft.s) },
              ].map((unit, index) => (
                <div key={unit.label} className="flex items-center gap-1.5">
                  <div className="min-w-[50px] rounded-lg bg-white/20 px-3 py-2 text-center backdrop-blur">
                    <div className="font-mono text-xl font-bold leading-none text-white">{unit.value}</div>
                    <div className="mt-0.5 text-[9px] text-red-100">{unit.label}</div>
                  </div>
                  {index < 2 && <span className="text-lg font-bold text-white">:</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {flashCourses.map((course) => (
            <Link key={course.id} to={`/courses/${course.slug ?? course.id}`} className="group">
              <div className="overflow-hidden rounded-xl bg-white shadow-lg transition-shadow hover:shadow-xl">
                <div className="relative overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white animate-pulse">
                    -{Math.round((1 - (course.price * 0.7) / course.price) * 100)}%
                  </div>
                </div>
                <div className="p-3">
                  <p className="mb-2 line-clamp-2 text-xs font-semibold text-gray-900">{course.title}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-red-600">{formatPriceCompact(Math.round(course.price * 0.7))}</span>
                    <span className="text-xs text-gray-400 line-through">{formatPriceCompact(course.price)}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500">
                    <span className="text-yellow-500">★{course.rating}</span>
                    <span>·</span>
                    <span>{course.students.toLocaleString()} học viên</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link to="/search" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50">
            Xem tất cả Flash Sale <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const [current, setCurrent] = useState(0);

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold text-gray-900">Học viên nói gì về chúng tôi</h2>
          <p className="text-gray-500">Hơn 50,000 học viên đã tin tưởng EduCourse</p>
        </div>
        <div className="relative mx-auto max-w-3xl">
          <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
            <div className="mb-4 flex justify-center">
              {Array.from({ length: testimonials[current].rating }).map((_, index) => (
                <Star key={index} className="size-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <blockquote className="mb-6 text-lg italic leading-relaxed text-gray-700">
              "{testimonials[current].text}"
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-lg font-bold text-white">
                {testimonials[current].avatar}
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">{testimonials[current].name}</p>
                <p className="text-sm text-gray-500">{testimonials[current].role}</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCurrent((value) => (value - 1 + testimonials.length) % testimonials.length)}
            className="absolute left-0 top-1/2 size-10 -translate-x-4 -translate-y-1/2 rounded-full bg-white shadow-md transition hover:text-blue-600"
          >
            <ChevronLeft className="mx-auto size-5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrent((value) => (value + 1) % testimonials.length)}
            className="absolute right-0 top-1/2 size-10 translate-x-4 -translate-y-1/2 rounded-full bg-white shadow-md transition hover:text-blue-600"
          >
            <ChevronRight className="mx-auto size-5" />
          </button>

          <div className="mt-4 flex justify-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrent(index)}
                className={`h-2 rounded-full transition-all ${index === current ? "w-6 bg-blue-600" : "w-2 bg-gray-300"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Instructors() {
  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold text-gray-900">Giảng viên hàng đầu</h2>
          <p className="text-gray-500">Học từ những chuyên gia UX/UI Design với kinh nghiệm thực chiến</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {instructors.map((item) => (
            <div key={item.name} className="group cursor-pointer text-center">
              <div className={`mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-3xl font-bold text-white shadow-lg transition-transform group-hover:scale-105`}>
                {item.avatar}
              </div>
              <h3 className="mb-0.5 font-bold text-gray-900">{item.name}</h3>
              <p className="mb-3 text-sm text-gray-500">{item.title}</p>
              <div className="flex items-center justify-center gap-3 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <BookOpen className="size-3" />{item.courses} KH
                </span>
                <span className="flex items-center gap-1">
                  <Users className="size-3" />{item.students.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="size-3 fill-yellow-400 text-yellow-400" />{item.rating}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LearningPaths() {
  return (
    <section className="bg-gray-50 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="mb-2 text-3xl font-bold text-gray-900">Lộ trình học tập</h2>
            <p className="text-gray-500">Học theo lộ trình để đạt mục tiêu nhanh nhất</p>
          </div>
          <Link to="/search" className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
            Xem tất cả <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {learningPaths.map((path) => (
            <div key={path.title} className={`cursor-pointer rounded-2xl border-2 ${path.color} p-6 transition hover:shadow-md`}>
              {path.badge && (
                <span className="mb-3 inline-block rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white">
                  {path.badge}
                </span>
              )}
              <div className="mb-4 text-4xl">{path.icon}</div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">{path.title}</h3>
              <p className="mb-4 text-sm text-gray-600">{path.desc}</p>
              <div className="mb-5 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <BookOpen className="size-4" />{path.courses} khóa học
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="size-4" />{path.level}
                </span>
              </div>
              <p className="mb-4 text-xs text-gray-400">⏱ Hoàn thành trong ~{path.duration}</p>
              <Link to="/search" className="block w-full rounded-xl border border-current bg-white py-2.5 text-center text-sm font-medium text-blue-600 transition hover:bg-blue-600 hover:text-white">
                Bắt đầu lộ trình →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyChooseUs() {
  const features = [
    { icon: "🎯", title: "Học thực chiến", desc: "Nội dung được thiết kế từ dự án thực tế, áp dụng ngay vào công việc" },
    { icon: "♾️", title: "Trọn đời", desc: "Mua một lần, học mãi mãi. Cập nhật nội dung mới miễn phí" },
    { icon: "🏆", title: "Chứng chỉ có giá trị", desc: "Chứng chỉ được công nhận bởi hơn 200 công ty trong ngành" },
    { icon: "💬", title: "Hỗ trợ 24/7", desc: "Đội ngũ hỗ trợ luôn sẵn sàng giải đáp mọi thắc mắc của bạn" },
    { icon: "🔁", title: "Hoàn tiền 30 ngày", desc: "Không hài lòng? Hoàn lại 100% học phí trong vòng 30 ngày" },
    { icon: "📱", title: "Học mọi thiết bị", desc: "Xem trên laptop, tablet hay điện thoại theo lịch của bạn" },
  ];

  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold text-gray-900">Tại sao chọn EduCourse?</h2>
          <p className="text-gray-500">Chúng tôi cam kết mang lại trải nghiệm học tốt nhất</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="flex gap-4 rounded-xl p-5 transition hover:bg-gray-50">
              <div className="flex-shrink-0 text-3xl">{feature.icon}</div>
              <div>
                <h3 className="mb-1 font-bold text-gray-900">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    let active = true;
    fetchCourses({ pageSize: 24, sort: "popular" })
      .then((courseDtos) => {
        if (!active) return;
        setCourses(courseDtos.map((dto) => mapCourseList(dto, language)));
      })
      .catch((error) => {
        console.error("Failed to load homepage courses", error);
        if (!active) return;
        setCourses([]);
      });

    return () => {
      active = false;
    };
  }, [language]);

  const filteredCourses = courses.filter((course) => {
    const matchesCategory = selectedCategory === "Tất cả" || course.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const featuredCourses = courses.slice(0, 3);
  const topRatedCourses = [...courses].sort((a, b) => b.rating - a.rating).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm">
                <Zap className="size-4 fill-yellow-300 text-yellow-300" />
                <span className="text-blue-100">Hơn 50,000 học viên đang học</span>
              </div>
              <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl">
                Làm chủ UX/UI Design <span className="text-yellow-300">từ hôm nay</span>
              </h1>
              <p className="mb-8 text-xl leading-relaxed text-blue-100">
                Học từ những chuyên gia hàng đầu thế giới. Nội dung thực chiến, chứng chỉ có giá trị, học mọi lúc mọi nơi.
              </p>
              <form onSubmit={handleSearch} className="mb-6 flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm khóa học, giảng viên..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="w-full rounded-xl py-4 pl-12 pr-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                <button type="submit" className="whitespace-nowrap rounded-xl bg-yellow-400 px-6 py-4 font-bold text-yellow-900 transition hover:bg-yellow-300">
                  Tìm ngay
                </button>
              </form>
              <div className="flex items-center gap-6 text-sm text-blue-200">
                <span>🔥 Gestalt Principles</span>
                <span>✍️ Microcopy</span>
                <span>📊 UX Analytics</span>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <div className="space-y-4 rounded-2xl bg-white/10 p-6 backdrop-blur">
                  {featuredCourses.map((course) => (
                    <Link key={course.id} to={`/courses/${course.slug ?? course.id}`} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/10">
                      <img src={course.image} alt={course.title} className="h-10 w-14 shrink-0 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{course.title}</p>
                        <p className="text-xs text-blue-300">{course.instructor}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-yellow-300">{formatPriceCompact(course.price)}</p>
                        <p className="text-xs text-blue-300">★{course.rating}</p>
                      </div>
                    </Link>
                  ))}
                  <Link to="/search" className="flex items-center justify-center gap-2 py-2 text-sm text-blue-200 transition hover:text-white">
                    Xem tất cả {courses.length} khóa học <ArrowRight className="size-4" />
                  </Link>
                </div>

                <div className="absolute -right-4 -top-4 rounded-2xl bg-yellow-400 px-4 py-2 text-yellow-900 shadow-xl">
                  <div className="flex items-center gap-2">
                    <Award className="size-5" />
                    <div>
                      <p className="text-sm font-bold">4.8★ Đánh giá</p>
                      <p className="text-xs">Từ 1,284 học viên</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-100 bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { icon: <BookOpen className="size-6 text-blue-600" />, value: "500+", label: "Khóa học" },
              { icon: <Users className="size-6 text-green-600" />, value: "50K+", label: "Học viên" },
              { icon: <Star className="size-6 fill-yellow-500 text-yellow-500" />, value: "4.8★", label: "Đánh giá TB" },
              { icon: <Award className="size-6 text-purple-600" />, value: "100+", label: "Giảng viên" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-gray-50">
                  {stat.icon}
                </div>
                <div className="mb-1 text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FlashSaleCountdown courses={courses} />

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="mb-2 text-3xl font-bold text-gray-900">Khóa học phổ biến</h2>
              <p className="text-gray-500">Được học viên yêu thích và đánh giá cao nhất</p>
            </div>
          <Link to="/search" className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
              Xem tất cả <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mb-6 overflow-x-auto">
            <div className="flex w-max gap-2 pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <p className="mb-6 text-sm text-gray-500">
            Tìm thấy <span className="font-semibold text-gray-900">{filteredCourses.length}</span> khóa học
          </p>

          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <BookOpen className="mx-auto mb-3 size-12 text-gray-200" />
              <p className="text-gray-500">Không tìm thấy khóa học nào phù hợp</p>
            </div>
          )}
        </div>
      </section>

      <LearningPaths />

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold text-gray-900">Đánh giá cao nhất</h2>
              <p className="text-gray-500">Các khóa học được yêu thích nhất từ học viên</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {topRatedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      <Instructors />
      <Testimonials />
      <WhyChooseUs />

      <section className="border-y border-blue-100 bg-blue-50 py-10">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h3 className="mb-2 text-xl font-bold text-gray-900">Chưa biết chọn khóa học nào?</h3>
          <p className="mb-5 text-gray-600">Sử dụng tính năng so sánh để tìm khóa học phù hợp nhất với bạn</p>
          <Link to="/compare" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700">
            <TrendingUp className="size-5" />
            So sánh khóa học
          </Link>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-white/20">
            <Play className="size-8 fill-white" />
          </div>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Bắt đầu hành trình học tập ngay hôm nay</h2>
          <p className="mb-8 text-xl text-blue-100">Tham gia cùng 50,000+ học viên đang phát triển sự nghiệp UX/UI Design</p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/search" className="rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-blue-600 transition hover:bg-blue-50">
              Khám phá khóa học
            </Link>
            <Link to="/compare" className="rounded-xl border-2 border-white px-8 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">
              So sánh khóa học
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
