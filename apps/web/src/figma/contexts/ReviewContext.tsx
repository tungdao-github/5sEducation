"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { fetchJson, fetchJsonWithAuth } from "@/lib/api";

export interface Review {
  id: string;
  courseId: string;
  userId?: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
  userLevel?: string;
}

interface ReviewContextType {
  reviewsByCourse: Record<string, Review[]>;
  getReviewsByCourse: (courseId: string) => Review[];
  loadReviews: (courseId: string) => Promise<void>;
  addReview: (courseId: string, rating: number, comment: string) => Promise<void>;
  hasUserReviewed: (courseId: string) => boolean;
  getCourseAverageRating: (courseId: string) => { avg: number; count: number };
  markHelpful: (reviewId: string) => void;
}

type ReviewDto = {
  id: number;
  courseId: number;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
  userId?: string;
};

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export function ReviewProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [reviewsByCourse, setReviewsByCourse] = useState<Record<string, Review[]>>({});

  const loadReviews = async (courseId: string) => {
    const data = await fetchJson<ReviewDto[]>(`/api/reviews?courseId=${courseId}`);
    const previous = reviewsByCourse[courseId] ?? [];
    const helpfulMap = new Map(previous.map((r) => [r.id, r.helpful]));
    const mapped = data.map((item) => ({
      id: String(item.id),
      courseId: String(item.courseId),
      userId: item.userId,
      userName: item.userName,
      rating: item.rating,
      comment: item.comment,
      createdAt: new Date(item.createdAt).toLocaleDateString("vi-VN"),
      helpful: helpfulMap.get(String(item.id)) ?? 0,
    }));

    setReviewsByCourse((prev) => ({ ...prev, [courseId]: mapped }));
  };

  const getReviewsByCourse = (courseId: string) => {
    return (reviewsByCourse[courseId] ?? []).slice();
  };

  const addReview = async (courseId: string, rating: number, comment: string) => {
    await fetchJsonWithAuth("/api/reviews", {
      method: "POST",
      body: JSON.stringify({ courseId: Number(courseId), rating, comment }),
    });
    await loadReviews(courseId);
  };

  const hasUserReviewed = (courseId: string) => {
    if (!user) return false;
    const reviews = reviewsByCourse[courseId] ?? [];
    return reviews.some((r) => r.userId && r.userId === user.id);
  };

  const getCourseAverageRating = (courseId: string) => {
    const courseReviews = reviewsByCourse[courseId] ?? [];
    if (courseReviews.length === 0) return { avg: 0, count: 0 };
    const sum = courseReviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      avg: parseFloat((sum / courseReviews.length).toFixed(1)),
      count: courseReviews.length,
    };
  };

  const markHelpful = (reviewId: string) => {
    setReviewsByCourse((prev) => {
      const updated: Record<string, Review[]> = {};
      Object.entries(prev).forEach(([courseId, list]) => {
        updated[courseId] = list.map((review) =>
          review.id === reviewId
            ? { ...review, helpful: review.helpful + 1 }
            : review
        );
      });
      return updated;
    });
  };

  return (
    <ReviewContext.Provider
      value={{
        reviewsByCourse,
        getReviewsByCourse,
        loadReviews,
        addReview,
        hasUserReviewed,
        getCourseAverageRating,
        markHelpful,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewContext);
  if (!context) throw new Error("useReviews must be used within ReviewProvider");
  return context;
}
