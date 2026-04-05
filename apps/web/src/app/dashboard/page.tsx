"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_URL, resolveApiAsset } from "@/lib/api";
import { CourseCard, type CourseSummary } from "@/components/CourseCard";
import { useI18n } from "@/app/providers";

interface Enrollment {
  id: number;
  courseId: number;
  courseTitle: string;
  courseSlug: string;
  thumbnailUrl: string;
  createdAt: string;
  lastLessonId?: number | null;
  totalLessons?: number;
  completedLessons?: number;
  progressPercent?: number;
}

interface CourseHistoryItem extends CourseSummary {
  viewedAt: string;
}

export default function DashboardPage() {
  const { tx, locale } = useI18n();
  const [items, setItems] = useState<Enrollment[]>([]);
  const [recentViews, setRecentViews] = useState<CourseHistoryItem[]>([]);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const totalEnrollments = items.length;
  const completedCount = items.filter((item) => (item.progressPercent ?? 0) >= 100).length;
  const avgProgress =
    items.length > 0
      ? Math.round(
          items.reduce((sum, item) => sum + (item.progressPercent ?? 0), 0) / items.length
        )
      : 0;

  const loadEnrollments = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/enrollments/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setItems(await res.json());
        return;
      }

      setError(tx("Unable to load your enrollments.", "Khong the tai khoa hoc da dang ky."));
    } catch {
      setError(tx("Unable to reach the API. Check that the backend is running.", "Khong the ket noi API. Hay kiem tra backend dang chay."));
    }
  };

  const loadHistory = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/history/views?limit=6`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setRecentViews(await res.json());
        return;
      }

      setError((prev) =>
        prev ?? tx("Unable to load recent views.", "Khong the tai lich su xem.")
      );
    } catch {
      setError((prev) =>
        prev ??
        tx(
          "Unable to reach the API. Check that the backend is running.",
          "Khong the ket noi API. Hay kiem tra backend dang chay."
        )
      );
    }
  };

  useEffect(() => {
    loadEnrollments();
    loadHistory();
  }, []);

  return (
    <div className="section-shell space-y-8 py-12 fade-in">
      <div className="space-y-2">
        <Link href="/courses" className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {tx("Courses", "Khoa hoc")}
        </Link>
        <h1 className="section-title text-4xl font-semibold text-emerald-950">
          {tx("My learning", "Hoc tap")}
        </h1>
        <p className="text-sm text-emerald-800/70">
          {tx("Track everything you have enrolled in.", "Theo doi tat ca khoa hoc ban da dang ky.")}
        </p>
        <div className="flex flex-wrap gap-3 text-sm text-emerald-800/70">
          <div className="stat-pill">
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-emerald-700">
              {tx("Enrolled", "Da dang ky")}
            </span>
            <span className="text-sm font-semibold text-emerald-950">{totalEnrollments}</span>
          </div>
          <div className="stat-pill">
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-emerald-700">
              {tx("Completed", "Hoan thanh")}
            </span>
            <span className="text-sm font-semibold text-emerald-950">{completedCount}</span>
          </div>
          <div className="stat-pill">
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-emerald-700">
              {tx("Avg progress", "Tien do TB")}
            </span>
            <span className="text-sm font-semibold text-emerald-950">{avgProgress}%</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="surface-card border border-amber-200 bg-amber-50/80 p-6 text-sm text-amber-900">
          <p>{error}</p>
          <p className="mt-2 text-xs text-amber-800/70">API_URL: {API_URL}</p>
        </div>
      )}

      {needsAuth ? (
        <div className="surface-card p-10 text-center">
          <p className="text-sm text-emerald-800/70">
            {tx("Please sign in to view your courses.", "Vui long dang nhap de xem khoa hoc cua ban.")}
          </p>
          <Link
            href="/login?next=/dashboard"
            className="mt-4 inline-flex rounded-full bg-emerald-700 px-6 py-2 text-sm font-semibold text-white"
          >
            {tx("Sign in", "Dang nhap")}
          </Link>
        </div>
      ) : items.length === 0 ? (
        <div className="surface-card p-10 text-center text-sm text-emerald-800/70">
          {tx("You have not enrolled in any courses yet.", "Ban chua dang ky khoa hoc nao.")}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 stagger">
          {items.map((item) => (
            <div key={item.id} className="surface-card p-4">
              <img
                src={resolveApiAsset(item.thumbnailUrl) || "/images/learning.jpg"}
                alt={item.courseTitle}
                className="h-40 w-full rounded-2xl object-cover"
              />
              <div className="mt-4 space-y-2">
                <Link href={`/courses/${item.courseSlug}`} className="text-lg font-semibold text-emerald-950">
                  {item.courseTitle}
                </Link>
                <p className="text-xs text-emerald-800/70">
                  {tx("Enrolled on", "Dang ky ngay")} {new Date(item.createdAt).toLocaleDateString()}
                </p>
                <div className="space-y-2">
                  <div className="h-2 w-full rounded-full bg-[color:var(--brand-soft)]">
                    <div
                      className="h-2 rounded-full bg-emerald-600"
                      style={{ width: `${Math.min(100, Math.max(0, item.progressPercent ?? 0))}%` }}
                    />
                  </div>
                  <p className="text-xs text-emerald-800/70">
                    {item.completedLessons ?? 0}/{item.totalLessons ?? 0} {tx("lessons completed", "bai hoc da hoan thanh")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/learn/${item.courseSlug}`}
                    className="rounded-full border border-[color:var(--stroke)] px-4 py-2 text-xs font-semibold text-emerald-900"
                  >
                    {tx("Continue", "Tiep tuc")}
                  </Link>
                  <Link
                    href={`/courses/${item.courseSlug}`}
                    className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white"
                  >
                    {tx("Course details", "Chi tiet khoa hoc")}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {recentViews.length > 0 && !needsAuth && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-title text-2xl font-semibold text-emerald-950">
              {tx("Recently viewed", "Da xem gan day")}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 stagger">
            {recentViews.map((course) => (
              <CourseCard key={course.id} course={course} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}


