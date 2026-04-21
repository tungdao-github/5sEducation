"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import { notify } from "@/lib/notify";
import { useI18n } from "@/app/providers";

interface ReviewDto {
  id: number;
  courseId: number;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
}

export function CourseReviews({ courseId, courseSlug }: { courseId: number; courseSlug: string }) {
  const { tx } = useI18n();
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);

  const loadReviews = async () => {
    const res = await fetch(`${API_URL}/api/reviews?courseId=${courseId}`);
    if (res.ok) {
      setReviews(await res.json());
    }
  };

  useEffect(() => {
    loadReviews();
  }, [courseId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    const res = await fetch(`${API_URL}/api/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ courseId, rating, comment }),
    });

    if (res.ok) {
      notify({
        title: tx("Review saved", "Da luu danh gia"),
        message: tx("Thanks for your feedback!", "Cam on ban da gui nhan xet!"),
      });
      setComment("");
      loadReviews();
    } else {
      notify({
        title: tx("Review failed", "Danh gia that bai"),
        message: tx("Please enroll in the course before reviewing.", "Hay dang ky khoa hoc truoc khi danh gia."),
      });
    }
  };

  const average = reviews.length
    ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length
    : 0;
  const rounded = Math.round(average);
  const stars = Array.from({ length: 5 }, (_, i) => (i < rounded ? "\u2605" : "\u2606")).join("");

  return (
    <section className="surface-card space-y-6 rounded-3xl p-6">
      <div className="flex flex-col gap-2">
        <h2 className="section-title text-2xl font-semibold text-emerald-950">
          {tx("Student feedback", "Danh gia hoc vien")}
        </h2>
        <div className="flex items-center gap-2 text-sm text-emerald-800/70">
          <span className="text-amber-500">{stars}</span>
          <span>{average.toFixed(1)}</span>
          <span>
            ({reviews.length} {tx("reviews", "danh gia")})
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[120px,1fr]">
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.currentTarget.value))}
            className="rounded-2xl border border-[color:var(--stroke)] bg-white px-3 py-2 text-sm"
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} {tx("stars", "sao")}
              </option>
            ))}
          </select>
          <input
            value={comment}
            onChange={(e) => setComment(e.currentTarget.value)}
            placeholder={tx("Write your feedback", "Viet nhan xet cua ban")}
            className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-2 text-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white"
          >
            {tx("Submit review", "Gui danh gia")}
          </button>
          {needsAuth && (
            <Link href={`/?auth=login&next=${encodeURIComponent(`/courses/${courseSlug}`)}`} className="text-xs font-semibold text-emerald-900">
              {tx("Sign in to review", "Dang nhap de danh gia")}
            </Link>
          )}
        </div>
      </form>

      <div className="space-y-4">
        {reviews.length === 0 && (
          <p className="text-sm text-emerald-800/70">
            {tx("No reviews yet. Be the first to share feedback.", "Chua co danh gia. Hay la nguoi dau tien nhan xet.")}
          </p>
        )}
        {reviews.map((review) => (
          <div key={review.id} className="rounded-2xl bg-white/70 p-4">
            <div className="flex items-center justify-between text-xs text-emerald-800/70">
              <span className="font-semibold text-emerald-950">{review.userName}</span>
              <span>{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="mt-2 text-sm text-emerald-900">{review.comment}</div>
            <div className="mt-1 text-xs text-amber-500">{"\u2605".repeat(review.rating)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

