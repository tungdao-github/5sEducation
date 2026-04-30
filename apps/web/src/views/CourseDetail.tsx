"use client";

import { Link } from "@/lib/router";
import { useI18n } from "@/app/providers";
import CourseDetailHero from "@/components/course-detail/CourseDetailHero";
import CourseDetailContent from "@/components/course-detail/CourseDetailContent";
import { useCourseDetailPage } from "@/components/course-detail/useCourseDetailPage";

export default function CourseDetail() {
  const detail = useCourseDetailPage();
  const { tx } = useI18n();

  if (detail.loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">{tx("Loading course...", "Đang tải khóa học...")}</div>
      </div>
    );
  }

  if (detail.error || !detail.course) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">{detail.error || tx("Course not found", "Không tìm thấy khóa học")}</h1>
        <Link to="/" className="text-blue-600 hover:underline">
          {tx("Back to home", "Quay về trang chủ")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_45%,#ffffff_100%)]">
      <CourseDetailHero course={detail.course} totalLessons={detail.totalLessons} inCart={detail.inCart} onAddToCart={detail.handleAddToCart} />
      <CourseDetailContent
        course={detail.course}
        totalLessons={detail.totalLessons}
        expandedSections={detail.expandedSections}
        onToggleSection={detail.handleToggleSection}
        courseReviews={detail.courseReviews}
        avgRating={detail.avgRating}
        reviewCount={detail.reviewCount}
        isAuthenticated={detail.isAuthenticated}
        userReviewed={detail.userReviewed}
        showReviewForm={detail.showReviewForm}
        reviewRating={detail.reviewRating}
        reviewComment={detail.reviewComment}
        onToggleReviewForm={() => detail.setShowReviewForm((current) => !current)}
        onReviewRatingChange={detail.setReviewRating}
        onReviewCommentChange={detail.setReviewComment}
        onSubmitReview={detail.handleSubmitReview}
        onCancelReview={detail.handleCancelReview}
        onLoginToReview={() => detail.openAuthModal("login")}
        onMarkHelpful={(reviewId) => {
          void detail.markHelpful(String(reviewId));
        }}
      />
    </div>
  );
}
