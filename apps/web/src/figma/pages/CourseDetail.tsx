"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  BarChart3,
  Users,
  Star,
  ShoppingCart,
  Check,
  PlayCircle,
  Award,
  BookOpen,
  ChevronDown,
  ThumbsUp,
  MessageSquare,
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useReviews } from "../contexts/ReviewContext";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useEffect, useState } from "react";
import { fetchCourseBySlug, mapCourseDetail, formatDuration, formatPrice } from "../data/api";
import type { Course } from "../contexts/CartContext";

const IMAGE_FALLBACK = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#0f172b"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <circle cx="1040" cy="160" r="220" fill="rgba(255,255,255,0.08)"/>
    <circle cx="240" cy="560" r="180" fill="rgba(255,255,255,0.06)"/>
    <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" fill="#e2e8f0" font-family="Arial, Helvetica, sans-serif" font-size="42">EduCourse</text>
  </svg>`
)}`;

function safeImage(src?: string | null) {
  return src && src.trim().length > 0 ? src : IMAGE_FALLBACK;
}

export default function CourseDetail() {
  const params = useParams();
  const id = (params?.slug || params?.id) as string;
  const { language } = useLanguage();
  const { addToCart, isInCart } = useCart();
  const {
    getReviewsByCourse,
    addReview,
    hasUserReviewed,
    getCourseAverageRating,
    markHelpful,
    loadReviews,
  } = useReviews();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [expandedSections, setExpandedSections] = useState<number[]>([0]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setError("");
    fetchCourseBySlug(id)
      .then((dto) => {
        if (!active) return;
        setCourse(mapCourseDetail(dto, language));
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Không thể tải khóa học");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, language]);

  useEffect(() => {
    if (!course?.id) return;
    loadReviews(course.id).catch(() => undefined);
  }, [course?.id, loadReviews]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">Đang tải khóa học...</div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {error || "Không tìm thấy khóa học"}
        </h1>
        <Link href="/" className="text-blue-600 hover:underline">
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  const inCart = isInCart(course.id);
  const courseReviews = getReviewsByCourse(course.id);
  const userReviewed = hasUserReviewed(course.id);
  const { avg: avgRating, count: reviewCount } = getCourseAverageRating(course.id);

  const handleAddToCart = () => {
    if (!inCart) {
      addToCart(course);
    }
  };

  const toggleSection = (index: number) => {
    setExpandedSections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const totalLessons =
    course.lessons || course.curriculum.reduce((sum, section) => sum + section.lessons, 0);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_45%,#ffffff_100%)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#081221_0%,#0f1c3a_52%,#07111f_100%)] text-white py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.22),transparent_24%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.18),transparent_22%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Course Info */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-100 shadow-lg backdrop-blur">
                <span className="size-2 rounded-full bg-sky-300" />
                {course.category}
              </div>
              <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.04em] md:text-5xl">
                {course.title}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                {course.description}
              </p>

              {/* Stats */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur">
                  <Star className="size-4 fill-yellow-300 text-yellow-300" />
                  <span className="font-semibold text-white">{course.rating}</span>
                  <span className="text-slate-300">({course.students.toLocaleString()} học viên)</span>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur">
                  <Clock className="size-4" />
                  <span className="text-slate-100">{course.duration}</span>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur">
                  <BarChart3 className="size-4" />
                  <span className="text-slate-100">{course.level}</span>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur">
                  <PlayCircle className="size-4" />
                  <span className="text-slate-100">{totalLessons} bài học</span>
                </div>
              </div>

              <p className="mt-6 text-slate-300">
                Được giảng dạy bởi: <span className="font-semibold text-white">{course.instructor}</span>
              </p>
            </div>

            {/* Course Card */}
            <div>
              <div className="sticky top-24 overflow-hidden rounded-[30px] border border-white/10 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
                <img
                  src={safeImage(course.image)}
                  alt={course.title}
                  className="w-full aspect-[16/10] object-cover"
                />
                <div className="p-6">
                  <div className="mb-5 flex items-center gap-3">
                    {course.originalPrice && (
                      <span className="text-gray-400 line-through">{formatPrice(course.originalPrice)}</span>
                    )}
                    <span className="text-3xl font-semibold text-slate-900">{formatPrice(course.price)}</span>
                    {course.originalPrice && (
                      <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-700">
                        Giảm {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}%
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={inCart}
                    className={`mb-3 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 font-semibold transition-all ${
                      inCart
                        ? "cursor-default bg-emerald-50 text-emerald-700"
                        : "bg-slate-900 text-white hover:bg-slate-700"
                    }`}
                  >
                    {inCart ? (
                      <>
                        <Check className="size-5" />
                        Đã thêm vào giỏ hàng
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="size-5" />
                        Thêm vào giỏ hàng
                      </>
                    )}
                  </button>

                  {inCart && (
                    <Link
                      href="/cart"
                      className="block w-full rounded-2xl bg-slate-900 py-3.5 text-center font-semibold text-white transition-colors hover:bg-slate-700"
                    >
                      Xem giỏ hàng
                    </Link>
                  )}

                  <Link
                    href={`/learn/${course.slug ?? course.id}`}
                    className="mt-3 block w-full rounded-2xl border border-slate-200 bg-white py-3 text-center text-sm font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    🎓 Vào học ngay
                  </Link>

                  <div className="mt-6 space-y-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Award className="size-5 text-blue-600" />
                      <span>Chứng chỉ hoàn thành</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="size-5 text-blue-600" />
                      <span>Truy cập trọn đời</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="size-5 text-blue-600" />
                      <span>Tài liệu học tập</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-8">
              {/* Learning Outcomes */}
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                <h2 className="mb-4 text-2xl font-semibold text-slate-950">Bạn sẽ học được gì</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  {course.learningOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Curriculum */}
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-slate-950">Chương trình giảng dạy</h2>
                  <div className="text-sm text-slate-500">
                    {course.curriculum.length} phần • {totalLessons} bài học
                  </div>
                </div>

                <div className="space-y-3">
                  {course.curriculum.map((section, index) => (
                    <div key={index} className="overflow-hidden rounded-2xl border border-slate-200">
                      <button
                        onClick={() => toggleSection(index)}
                        className="flex w-full items-center justify-between p-4 transition-colors hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          <ChevronDown
                            className={`size-5 text-slate-500 transition-transform ${
                              expandedSections.includes(index) ? "rotate-180" : ""
                            }`}
                          />
                          <div className="text-left">
                            <div className="font-semibold text-slate-950">{section.title}</div>
                            <div className="text-sm text-slate-500">
                              {section.lessons} bài học • {section.duration}
                            </div>
                          </div>
                        </div>
                      </button>

                      {expandedSections.includes(index) && (
                        <div className="bg-slate-50 px-4 pb-4">
                          <div className="space-y-2 pt-2">
                            {section.items && section.items.length > 0 ? (
                              section.items.map((lesson, lessonIndex) => (
                                <div
                                  key={`${lesson.title}-${lessonIndex}`}
                                  className="flex items-center gap-2 py-2 text-sm text-slate-600"
                                >
                                  <PlayCircle className="size-4" />
                                  <span className="flex-1">{lesson.title}</span>
                                  {lesson.durationMinutes ? (
                                    <span className="text-xs text-slate-400">
                                      {formatDuration(lesson.durationMinutes)}
                                    </span>
                                  ) : null}
                                </div>
                              ))
                            ) : (
                              Array.from({ length: section.lessons }).map((_, lessonIndex) => (
                                <div
                                  key={lessonIndex}
                                  className="flex items-center gap-2 py-2 text-sm text-slate-600"
                                >
                                  <PlayCircle className="size-4" />
                                  <span>Bài {lessonIndex + 1}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Description */}
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                <h2 className="mb-4 text-2xl font-semibold text-slate-950">Mô tả khóa học</h2>
                <p className="leading-relaxed text-slate-700">{course.description}</p>
              </div>

              {/* Reviews Section */}
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="mb-2 text-2xl font-semibold text-slate-950">Đánh giá từ học viên</h2>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star className="size-6 fill-yellow-400 text-yellow-400" />
                        <span className="text-2xl font-semibold text-slate-950">
                          {avgRating > 0 ? avgRating : course.rating}
                        </span>
                      </div>
                      <span className="text-slate-500">
                        ({(reviewCount > 0 ? reviewCount : course.students).toLocaleString()} đánh giá)
                      </span>
                    </div>
                  </div>

                  {isAuthenticated && !userReviewed && (
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-2.5 text-white transition hover:bg-slate-700"
                    >
                      <MessageSquare className="size-5" />
                      Viết đánh giá
                    </button>
                  )}

                  {!isAuthenticated && (
                    <button
                      onClick={() => openAuthModal("login")}
                      className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-2.5 text-white transition hover:bg-slate-700"
                    >
                      <MessageSquare className="size-5" />
                      Đăng nhập để đánh giá
                    </button>
                  )}
                </div>

                {/* Review Form */}
                {showReviewForm && isAuthenticated && !userReviewed && (
                  <div className="mb-6 rounded-2xl bg-slate-50 p-4">
                    <h3 className="mb-3 font-semibold text-slate-950">Viết đánh giá của bạn</h3>
                    <div className="mb-4">
                      <label className="mb-2 block text-sm font-medium text-slate-700">Đánh giá của bạn</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setReviewRating(rating)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`size-8 transition ${
                                rating <= reviewRating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="mb-2 block text-sm font-medium text-slate-700">Nhận xét của bạn</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={4}
                        placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
                        className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          if (reviewComment.trim()) {
                            addReview(course.id, reviewRating, reviewComment);
                            setReviewComment("");
                            setReviewRating(5);
                            setShowReviewForm(false);
                          }
                        }}
                        className="rounded-2xl bg-slate-900 px-6 py-2 text-white transition hover:bg-slate-700"
                      >
                        Gửi đánh giá
                      </button>
                      <button
                        onClick={() => {
                          setShowReviewForm(false);
                          setReviewComment("");
                          setReviewRating(5);
                        }}
                        className="rounded-2xl bg-slate-200 px-6 py-2 text-slate-700 transition hover:bg-slate-300"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  {courseReviews.length === 0 ? (
                    <div className="py-8 text-center text-slate-500">
                      <MessageSquare className="mx-auto mb-2 size-12 text-slate-400" />
                      <p>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá khóa học này!</p>
                    </div>
                  ) : (
                    courseReviews.map((review) => (
                      <div key={review.id} className="border-b border-slate-200 pb-4 last:border-0">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2563eb,#7c3aed)] font-semibold text-white">
                            {review.userName.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-slate-950">{review.userName}</span>
                              {review.userLevel && (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    review.userLevel === "Platinum"
                                      ? "bg-purple-100 text-purple-800"
                                      : review.userLevel === "Gold"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : review.userLevel === "Silver"
                                      ? "bg-gray-100 text-gray-800"
                                      : "bg-orange-100 text-orange-800"
                                  }`}
                                >
                                  {review.userLevel}
                                </span>
                              )}
                              <span className="text-sm text-slate-500">• {review.createdAt}</span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`size-4 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="mb-3 text-slate-700">{review.comment}</p>
                            <button
                              onClick={() => markHelpful(review.id)}
                              className="flex items-center gap-2 text-sm text-slate-600 transition hover:text-blue-600"
                            >
                              <ThumbsUp className="size-4" />
                              <span>Hữu ích ({review.helpful})</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Empty for desktop layout consistency */}
            <div className="lg:col-span-1"></div>
          </div>
        </div>
      </section>
    </div>
  );
}
