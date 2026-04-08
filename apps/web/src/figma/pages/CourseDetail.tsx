"use client";

import { useParams, Link } from "@/figma/compat/router";
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

export default function CourseDetail() {
  const { id } = useParams();
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
        <Link to="/" className="text-blue-600 hover:underline">
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="inline-block bg-blue-600 px-3 py-1 rounded-full text-sm mb-4">
                {course.category}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-gray-300 mb-6">{course.description}</p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="size-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{course.rating}</span>
                  <span className="text-gray-400">({course.students.toLocaleString()} học viên)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-5" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="size-5" />
                  <span>{course.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircle className="size-5" />
                  <span>{totalLessons} bài học</span>
                </div>
              </div>

              <p className="text-gray-300">
                Được giảng dạy bởi: <span className="font-semibold text-white">{course.instructor}</span>
              </p>
            </div>

            {/* Course Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg overflow-hidden shadow-xl sticky top-20">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full aspect-video object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    {course.originalPrice && (
                      <span className="text-gray-400 line-through">{formatPrice(course.originalPrice)}</span>
                    )}
                    <span className="text-3xl font-bold text-blue-600">{formatPrice(course.price)}</span>
                    {course.originalPrice && (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-semibold">
                        Giảm {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}%
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={inCart}
                    className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all mb-3 ${
                      inCart
                        ? "bg-green-100 text-green-700 cursor-default"
                        : "bg-blue-600 text-white hover:bg-blue-700"
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
                      to="/cart"
                      className="block w-full py-3 rounded-lg font-semibold text-center bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      Xem giỏ hàng
                    </Link>
                  )}

                  <div className="mt-6 space-y-3 text-sm text-gray-600">
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
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Learning Outcomes */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Bạn sẽ học được gì</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  {course.learningOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Curriculum */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Chương trình giảng dạy</h2>
                  <div className="text-sm text-gray-600">
                    {course.curriculum.length} phần • {totalLessons} bài học
                  </div>
                </div>

                <div className="space-y-3">
                  {course.curriculum.map((section, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSection(index)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <ChevronDown
                            className={`size-5 text-gray-600 transition-transform ${
                              expandedSections.includes(index) ? "rotate-180" : ""
                            }`}
                          />
                          <div className="text-left">
                            <div className="font-semibold text-gray-900">{section.title}</div>
                            <div className="text-sm text-gray-600">
                              {section.lessons} bài học • {section.duration}
                            </div>
                          </div>
                        </div>
                      </button>

                      {expandedSections.includes(index) && (
                        <div className="px-4 pb-4 bg-gray-50">
                          <div className="space-y-2 pt-2">
                            {section.items && section.items.length > 0 ? (
                              section.items.map((lesson, lessonIndex) => (
                                <div
                                  key={`${lesson.title}-${lessonIndex}`}
                                  className="flex items-center gap-2 text-sm text-gray-600 py-2"
                                >
                                  <PlayCircle className="size-4" />
                                  <span className="flex-1">{lesson.title}</span>
                                  {lesson.durationMinutes ? (
                                    <span className="text-xs text-gray-400">
                                      {formatDuration(lesson.durationMinutes)}
                                    </span>
                                  ) : null}
                                </div>
                              ))
                            ) : (
                              Array.from({ length: section.lessons }).map((_, lessonIndex) => (
                                <div
                                  key={lessonIndex}
                                  className="flex items-center gap-2 text-sm text-gray-600 py-2"
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
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Mô tả khóa học</h2>
                <p className="text-gray-700 leading-relaxed">{course.description}</p>
              </div>

              {/* Reviews Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Đánh giá từ học viên</h2>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star className="size-6 fill-yellow-400 text-yellow-400" />
                        <span className="text-2xl font-bold text-gray-900">
                          {avgRating > 0 ? avgRating : course.rating}
                        </span>
                      </div>
                      <span className="text-gray-600">
                        ({(reviewCount > 0 ? reviewCount : course.students).toLocaleString()} đánh giá)
                      </span>
                    </div>
                  </div>

                  {isAuthenticated && !userReviewed && (
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition"
                    >
                      <MessageSquare className="size-5" />
                      Viết đánh giá
                    </button>
                  )}

                  {!isAuthenticated && (
                    <button
                      onClick={() => openAuthModal("login")}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition"
                    >
                      <MessageSquare className="size-5" />
                      Đăng nhập để đánh giá
                    </button>
                  )}
                </div>

                {/* Review Form */}
                {showReviewForm && isAuthenticated && !userReviewed && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Viết đánh giá của bạn</h3>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá của bạn</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nhận xét của bạn</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={4}
                        placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        Gửi đánh giá
                      </button>
                      <button
                        onClick={() => {
                          setShowReviewForm(false);
                          setReviewComment("");
                          setReviewRating(5);
                        }}
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  {courseReviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="size-12 mx-auto mb-2 text-gray-400" />
                      <p>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá khóa học này!</p>
                    </div>
                  ) : (
                    courseReviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {review.userName.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">{review.userName}</span>
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
                              <span className="text-sm text-gray-500">• {review.createdAt}</span>
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
                            <p className="text-gray-700 mb-3">{review.comment}</p>
                            <button
                              onClick={() => markHelpful(review.id)}
                              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition"
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
