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
      ? Math.round(items.reduce((sum, item) => sum + (item.progressPercent ?? 0), 0) / items.length)
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
      setError(tx("Unable to reach the API.", "Khong the ket noi API."));
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

      setError((prev) => prev ?? tx("Unable to load recent views.", "Khong the tai lich su xem."));
    } catch {
      setError((prev) => prev ?? tx("Unable to reach the API.", "Khong the ket noi API."));
    }
  };

  useEffect(() => {
    loadEnrollments();
    loadHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <Link href="/courses" className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            {tx("Courses", "Khoa hoc")}
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">{tx("My learning", "Hoc tap")}</h1>
          <p className="text-sm text-gray-600">
            {tx("Track everything you have enrolled in.", "Theo doi tat ca khoa hoc ban da dang ky.")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{tx("Enrolled", "Da dang ky")}</p>
            <p className="text-2xl font-bold text-gray-900">{totalEnrollments}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{tx("Completed", "Hoan thanh")}</p>
            <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{tx("Avg progress", "Tien do TB")}</p>
            <p className="text-2xl font-bold text-gray-900">{avgProgress}%</p>
          </div>
        </div>

        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
            {error}
          </div>
        )}

        {needsAuth ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-600 mb-4">{tx("Please sign in to view your courses.", "Vui long dang nhap de xem khoa hoc.")}</p>
            <Link
              href="/login?next=/dashboard"
              className="inline-flex rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white"
            >
              {tx("Sign in", "Dang nhap")}
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-sm text-gray-600">
            {tx("You have not enrolled in any courses yet.", "Ban chua dang ky khoa hoc nao.")}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <img
                  src={resolveApiAsset(item.thumbnailUrl) || "/images/learning.jpg"}
                  alt={item.courseTitle}
                  className="h-40 w-full rounded-lg object-cover"
                />
                <div className="mt-4 space-y-2">
                  <Link href={`/courses/${item.courseSlug}`} className="text-lg font-semibold text-gray-900">
                    {item.courseTitle}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {tx("Enrolled on", "Dang ky ngay")} {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                  <div className="space-y-2">
                    <div className="h-2 w-full rounded-full bg-blue-100">
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `${Math.min(100, Math.max(0, item.progressPercent ?? 0))}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {item.completedLessons ?? 0}/{item.totalLessons ?? 0} {tx("lessons completed", "bai hoc da hoan thanh")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/learn/${item.courseSlug}`}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700"
                    >
                      {tx("Continue", "Tiep tuc")}
                    </Link>
                    <Link
                      href={`/courses/${item.courseSlug}`}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
                    >
                      {tx("Course details", "Chi tiet")}
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
              <h2 className="text-2xl font-semibold text-gray-900">{tx("Recently viewed", "Da xem gan day")}</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recentViews.map((course) => (
                <CourseCard key={course.id} course={course} locale={locale} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
