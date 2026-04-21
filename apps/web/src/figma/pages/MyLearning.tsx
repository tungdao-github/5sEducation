"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/figma/compat/router";
import { BookOpen, Clock, Award, PlayCircle, TrendingUp, CheckCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { fetchEnrollments, fetchCoursesByIds, mapCourseCompare } from "../data/api";
import type { Course } from "../contexts/CartContext";
import { useLanguage } from "../contexts/LanguageContext";

const IMAGE_FALLBACK = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <rect width="100%" height="100%" fill="#0f172a"/>
    <circle cx="1000" cy="160" r="180" fill="rgba(255,255,255,0.08)"/>
    <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" fill="#cbd5e1" font-family="Arial, Helvetica, sans-serif" font-size="42">EduCourse</text>
  </svg>`
)}`;

function safeImage(src?: string | null) {
  return src && src.trim().length > 0 ? src : IMAGE_FALLBACK;
}

interface LearningCourse extends Course {
  progress: number;
  lastAccessed: string;
  completedLessons: number;
  totalLessons: number;
}

export default function MyLearning() {
  const { user, isAuthenticated, openAuthModal } = useAuth();
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

        const ids = enrollments.map((e) => e.courseId);
        const compareDtos = await fetchCoursesByIds(ids);
        if (!active) return;
        const courseMap = new Map(compareDtos.map((dto) => [dto.id, mapCourseCompare(dto, language)]));

        const merged = enrollments.map((en) => {
          const base = courseMap.get(en.courseId);
          const fallback: Course = base ?? {
            id: String(en.courseId),
            slug: en.courseSlug,
            title: en.courseTitle,
            price: 0,
            image: en.thumbnailUrl,
            instructor: "Đang cập nhật",
            duration: "—",
            level: "—",
            lessons: en.totalLessons,
            students: 0,
            rating: 0,
            category: "Khác",
            description: "",
            learningOutcomes: [],
            curriculum: [],
          };

          return {
            ...fallback,
            progress: en.progressPercent,
            lastAccessed: en.createdAt,
            completedLessons: en.completedLessons,
            totalLessons: en.totalLessons,
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

    load();

    return () => {
      active = false;
    };
  }, [isAuthenticated, language]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] flex items-center justify-center px-4">
        <div className="max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_70px_rgba(15,23,42,0.12)]">
          <BookOpen className="mx-auto mb-4 size-20 text-slate-300" />
          <h1 className="mb-2 text-2xl font-semibold text-slate-950">Đăng nhập để xem khóa học của bạn</h1>
          <p className="mb-6 text-slate-600">Bạn cần đăng nhập để truy cập vào các khóa học đã mua và theo dõi tiến độ học tập.</p>
          <button
            onClick={() => openAuthModal("login")}
            className="rounded-2xl bg-slate-900 px-8 py-3 text-white transition hover:bg-slate-700"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  const inProgressCourses = courses.filter((course) => course.progress > 0 && course.progress < 100);
  const completedCourses = courses.filter((course) => course.progress >= 100);
  const notStartedCourses = courses.filter((course) => course.progress === 0);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <section className="bg-[linear-gradient(135deg,#081221_0%,#1d4ed8_50%,#4f46e5_100%)] text-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] md:text-5xl">Khóa học của tôi</h1>
          <p className="mt-3 text-lg text-slate-200">Tiếp tục hành trình học tập của bạn</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
              <div className="flex items-center gap-3"><BookOpen className="size-8" /><div><p className="text-2xl font-bold">{courses.length}</p><p className="text-sm text-blue-100">Tổng khóa học</p></div></div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
              <div className="flex items-center gap-3"><TrendingUp className="size-8" /><div><p className="text-2xl font-bold">{inProgressCourses.length}</p><p className="text-sm text-blue-100">Đang học</p></div></div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
              <div className="flex items-center gap-3"><CheckCircle className="size-8" /><div><p className="text-2xl font-bold">{completedCourses.length}</p><p className="text-sm text-blue-100">Hoàn thành</p></div></div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {loading ? (
          <div className="py-16 text-center text-slate-500">Đang tải khóa học...</div>
        ) : courses.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-white py-16 text-center shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <BookOpen className="mx-auto mb-4 size-20 text-slate-300" />
            <h2 className="mb-2 text-2xl font-semibold text-slate-950">Chưa có khóa học nào</h2>
            <p className="mb-6 text-slate-600">Bạn chưa mua khóa học nào. Khám phá các khóa học chất lượng của chúng tôi!</p>
            <Link to="/" className="inline-block rounded-2xl bg-slate-900 px-8 py-3 text-white transition hover:bg-slate-700">Khám phá khóa học</Link>
          </div>
        ) : (
          <div className="space-y-10">
            {inProgressCourses.length > 0 && (
              <section>
                <div className="mb-6 flex items-center gap-2"><TrendingUp className="size-6 text-blue-600" /><h2 className="text-2xl font-semibold text-slate-950">Đang học ({inProgressCourses.length})</h2></div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {inProgressCourses.map((course) => (
                    <div key={course.id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
                      <img src={safeImage(course.image)} alt={course.title} className="h-48 w-full object-cover" />
                      <div className="p-5">
                        <h3 className="mb-2 line-clamp-2 font-semibold text-slate-950">{course.title}</h3>
                        <p className="mb-4 text-sm text-slate-500">Giảng viên: {course.instructor}</p>
                        <div className="mb-4">
                          <div className="mb-2 flex justify-between text-sm text-slate-600"><span>{course.progress}% hoàn thành</span><span>{course.completedLessons}/{course.totalLessons} bài</span></div>
                          <div className="h-2 w-full rounded-full bg-slate-200"><div className="h-2 rounded-full bg-slate-900 transition-all" style={{ width: `${course.progress}%` }} /></div>
                        </div>
                        <Link to={`/learn/${course.slug ?? course.id}`} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-2.5 text-white transition hover:bg-slate-700"><PlayCircle className="size-5" />Tiếp tục học</Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {completedCourses.length > 0 && (
              <section>
                <div className="mb-6 flex items-center gap-2"><Award className="size-6 text-green-600" /><h2 className="text-2xl font-semibold text-slate-950">Đã hoàn thành ({completedCourses.length})</h2></div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {completedCourses.map((course) => (
                    <div key={course.id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
                      <div className="relative">
                        <img src={safeImage(course.image)} alt={course.title} className="h-48 w-full object-cover" />
                        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-sm font-semibold text-white"><CheckCircle className="size-4" />Hoàn thành</div>
                      </div>
                      <div className="p-5">
                        <h3 className="mb-2 line-clamp-2 font-semibold text-slate-950">{course.title}</h3>
                        <p className="mb-4 text-sm text-slate-500">Giảng viên: {course.instructor}</p>
                        <div className="flex gap-2">
                          <Link to={`/learn/${course.slug ?? course.id}`} className="flex-1 rounded-2xl bg-slate-100 py-2.5 text-center text-slate-700 transition hover:bg-slate-200">Xem lại</Link>
                          <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 py-2.5 text-white transition hover:bg-slate-700"><Award className="size-5" />Chứng chỉ</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {notStartedCourses.length > 0 && (
              <section>
                <div className="mb-6 flex items-center gap-2"><Clock className="size-6 text-slate-600" /><h2 className="text-2xl font-semibold text-slate-950">Chưa bắt đầu ({notStartedCourses.length})</h2></div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {notStartedCourses.map((course) => (
                    <div key={course.id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
                      <img src={safeImage(course.image)} alt={course.title} className="h-48 w-full object-cover" />
                      <div className="p-5">
                        <h3 className="mb-2 line-clamp-2 font-semibold text-slate-950">{course.title}</h3>
                        <p className="mb-4 text-sm text-slate-500">Giảng viên: {course.instructor}</p>
                        <Link to={`/learn/${course.slug ?? course.id}`} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-2.5 text-white transition hover:bg-slate-700"><PlayCircle className="size-5" />Bắt đầu học</Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
