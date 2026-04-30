"use client";

import type { Course } from "@/contexts/CartContext";
import CourseDetailOutcomes from "@/components/course-detail/CourseDetailOutcomes";
import CourseDetailCurriculum from "@/components/course-detail/CourseDetailCurriculum";
import CourseDetailDescription from "@/components/course-detail/CourseDetailDescription";
import CourseDetailReviews from "@/components/course-detail/CourseDetailReviews";

type Props = {
  course: Course;
  totalLessons: number;
  expandedSections: number[];
  onToggleSection: (index: number) => void;
  courseReviews: Array<{
    id: string | number;
    userName: string;
    userLevel?: string;
    createdAt: string;
    rating: number;
    comment: string;
    helpful: number;
  }>;
  avgRating: number;
  reviewCount: number;
  isAuthenticated: boolean;
  userReviewed: boolean;
  showReviewForm: boolean;
  reviewRating: number;
  reviewComment: string;
  onToggleReviewForm: () => void;
  onReviewRatingChange: (rating: number) => void;
  onReviewCommentChange: (value: string) => void;
  onSubmitReview: () => void;
  onCancelReview: () => void;
  onLoginToReview: () => void;
  onMarkHelpful: (id: string | number) => void;
};

export default function CourseDetailContent({
  course,
  totalLessons,
  expandedSections,
  onToggleSection,
  courseReviews,
  avgRating,
  reviewCount,
  isAuthenticated,
  userReviewed,
  showReviewForm,
  reviewRating,
  reviewComment,
  onToggleReviewForm,
  onReviewRatingChange,
  onReviewCommentChange,
  onSubmitReview,
  onCancelReview,
  onLoginToReview,
  onMarkHelpful,
}: Props) {
  return (
    <section className="py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-8">
            <CourseDetailOutcomes outcomes={course.learningOutcomes} />
            <CourseDetailCurriculum sections={course.curriculum} totalLessons={totalLessons} expandedSections={expandedSections} onToggleSection={onToggleSection} />
            <CourseDetailDescription description={course.description} />
            <CourseDetailReviews
              courseRating={course.rating}
              avgRating={avgRating}
              reviewCount={reviewCount}
              isAuthenticated={isAuthenticated}
              userReviewed={userReviewed}
              showReviewForm={showReviewForm}
              reviewRating={reviewRating}
              reviewComment={reviewComment}
              courseStudents={course.students}
              reviews={courseReviews}
              onToggleReviewForm={onToggleReviewForm}
              onReviewRatingChange={onReviewRatingChange}
              onReviewCommentChange={onReviewCommentChange}
              onSubmitReview={onSubmitReview}
              onCancelReview={onCancelReview}
              onLoginToReview={onLoginToReview}
              onMarkHelpful={onMarkHelpful}
            />
          </div>

          <div className="lg:col-span-1" />
        </div>
      </div>
    </section>
  );
}
