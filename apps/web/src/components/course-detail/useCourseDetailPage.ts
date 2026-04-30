"use client";

import { useEffect, useState } from "react";
import { useParams } from "@/lib/router";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useReviews } from "@/contexts/ReviewContext";
import { useI18n } from "@/app/providers";
import { fetchCourseBySlug, mapCourseDetail } from "@/services/api";
import type { Course } from "@/contexts/CartContext";

type ReviewItem = {
  id: string | number;
  userName: string;
  userLevel?: string;
  createdAt: string;
  rating: number;
  comment: string;
  helpful: number;
};

export function useCourseDetailPage() {
  const { id } = useParams();
  const { locale, tx } = useI18n();
  const { addToCart, isInCart } = useCart();
  const { getReviewsByCourse, addReview, hasUserReviewed, getCourseAverageRating, markHelpful, loadReviews } =
    useReviews();
  const { isAuthenticated, openAuthModal } = useAuth();

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
        setCourse(mapCourseDetail(dto, locale));
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : tx("Failed to load course.", "Không thể tải khóa học."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, locale, tx]);

  useEffect(() => {
    if (!course?.id) return;
    void loadReviews(course.id);
  }, [course?.id, loadReviews]);

  const inCart = course ? isInCart(course.id) : false;
  const courseReviews = course ? (getReviewsByCourse(course.id) as ReviewItem[]) : [];
  const userReviewed = course ? hasUserReviewed(course.id) : false;
  const { avg: avgRating, count: reviewCount } = course ? getCourseAverageRating(course.id) : { avg: 0, count: 0 };
  const totalLessons = course ? course.lessons || course.curriculum.reduce((sum, section) => sum + section.lessons, 0) : 0;

  const handleAddToCart = () => {
    if (course && !inCart) addToCart(course);
  };

  const handleToggleSection = (index: number) => {
    setExpandedSections((prev) => (prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]));
  };

  const handleSubmitReview = () => {
    if (course && reviewComment.trim()) {
      addReview(course.id, reviewRating, reviewComment);
      setReviewComment("");
      setReviewRating(5);
      setShowReviewForm(false);
    }
  };

  const handleCancelReview = () => {
    setShowReviewForm(false);
    setReviewComment("");
    setReviewRating(5);
  };

  return {
    course,
    loading,
    error,
    inCart,
    totalLessons,
    expandedSections,
    handleToggleSection,
    courseReviews,
    avgRating,
    reviewCount,
    isAuthenticated,
    userReviewed,
    showReviewForm,
    reviewRating,
    reviewComment,
    setReviewRating,
    setReviewComment,
    setShowReviewForm,
    handleSubmitReview,
    handleCancelReview,
    handleAddToCart,
    openAuthModal,
    markHelpful,
  } as const;
}
