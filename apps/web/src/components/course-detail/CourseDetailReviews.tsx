"use client";

import { MessageSquare, Star, ThumbsUp } from "lucide-react";

type Review = {
  id: string | number;
  userName: string;
  userLevel?: string;
  createdAt: string;
  rating: number;
  comment: string;
  helpful: number;
};

type Props = {
  courseRating: number;
  avgRating: number;
  reviewCount: number;
  isAuthenticated: boolean;
  userReviewed: boolean;
  showReviewForm: boolean;
  reviewRating: number;
  reviewComment: string;
  courseStudents: number;
  reviews: Review[];
  onToggleReviewForm: () => void;
  onReviewRatingChange: (rating: number) => void;
  onReviewCommentChange: (value: string) => void;
  onSubmitReview: () => void;
  onCancelReview: () => void;
  onLoginToReview: () => void;
  onMarkHelpful: (id: string | number) => void;
};

export default function CourseDetailReviews({
  courseRating,
  avgRating,
  reviewCount,
  isAuthenticated,
  userReviewed,
  showReviewForm,
  reviewRating,
  reviewComment,
  courseStudents,
  reviews,
  onToggleReviewForm,
  onReviewRatingChange,
  onReviewCommentChange,
  onSubmitReview,
  onCancelReview,
  onLoginToReview,
  onMarkHelpful,
}: Props) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-2xl font-semibold text-slate-950">Đánh giá từ học viên</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="size-6 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-semibold text-slate-950">{avgRating > 0 ? avgRating : courseRating}</span>
            </div>
            <span className="text-slate-500">({(reviewCount > 0 ? reviewCount : courseStudents).toLocaleString()} đánh giá)</span>
          </div>
        </div>

        {isAuthenticated && !userReviewed ? (
          <button onClick={onToggleReviewForm} className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-2.5 text-white transition hover:bg-slate-700">
            <MessageSquare className="size-5" />
            Viết đánh giá
          </button>
        ) : null}

        {!isAuthenticated ? (
          <button onClick={onLoginToReview} className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-2.5 text-white transition hover:bg-slate-700">
            <MessageSquare className="size-5" />
            Đăng nhập để đánh giá
          </button>
        ) : null}
      </div>

      {showReviewForm && isAuthenticated && !userReviewed ? (
        <div className="mb-6 rounded-2xl bg-slate-50 p-4">
          <h3 className="mb-3 font-semibold text-slate-950">Viết đánh giá của bạn</h3>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">Đánh giá của bạn</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button key={rating} onClick={() => onReviewRatingChange(rating)} className="focus:outline-none">
                  <Star className={`size-8 transition ${rating <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">Nhận xét của bạn</label>
            <textarea
              value={reviewComment}
              onChange={(event) => onReviewCommentChange(event.target.value)}
              rows={4}
              placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
              className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={onSubmitReview} className="rounded-2xl bg-slate-900 px-6 py-2 text-white transition hover:bg-slate-700">
              Gửi đánh giá
            </button>
            <button onClick={onCancelReview} className="rounded-2xl bg-slate-200 px-6 py-2 text-slate-700 transition hover:bg-slate-300">
              Hủy
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <MessageSquare className="mx-auto mb-2 size-12 text-slate-400" />
            <p>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá khóa học này!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-slate-200 pb-4 last:border-0">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2563eb,#7c3aed)] font-semibold text-white">
                  {review.userName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-semibold text-slate-950">{review.userName}</span>
                    {review.userLevel ? (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
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
                    ) : null}
                    <span className="text-sm text-slate-500">• {review.createdAt}</span>
                  </div>
                  <div className="mb-2 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className={`size-4 ${index < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                    ))}
                  </div>
                  <p className="mb-3 text-slate-700">{review.comment}</p>
                  <button onClick={() => onMarkHelpful(review.id)} className="flex items-center gap-2 text-sm text-slate-600 transition hover:text-blue-600">
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
  );
}
