"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_URL, resolveApiAsset } from "@/lib/api";
import { useI18n } from "@/app/providers";

interface CourseManage {
  id: number;
  title: string;
  slug: string;
  price: number;
  thumbnailUrl: string;
  level: string;
  language: string;
  isPublished: boolean;
  updatedAt?: string;
  category?: {
    id: number;
    title: string;
    slug: string;
  } | null;
}

export default function StudioPage() {
  const { tx } = useI18n();
  const [courses, setCourses] = useState<CourseManage[]>([]);
  const [needsAuth, setNeedsAuth] = useState(false);

  const loadCourses = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    const res = await fetch(`${API_URL}/api/instructor/courses`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setCourses(await res.json());
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  return (
    <div className="section-shell space-y-8 py-12 fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Link href="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            {tx("Home", "Trang chu")}
          </Link>
          <h1 className="section-title text-4xl font-semibold text-emerald-950">
            {tx("Instructor studio", "Studio giang vien")}
          </h1>
          <p className="text-sm text-emerald-800/70">
            {tx("Manage your courses and content.", "Quan ly khoa hoc va noi dung cua ban.")}
          </p>
        </div>
        <Link
          href="/studio/new"
          className="inline-flex rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white"
        >
          {tx("Create course", "Tao khoa hoc")}
        </Link>
      </div>

      {needsAuth ? (
        <div className="surface-card rounded-3xl p-10 text-center">
          <p className="text-sm text-emerald-800/70">
            {tx("Please sign in to access Studio.", "Vui long dang nhap de vao Studio.")}
          </p>
          <Link
            href="/login?next=/studio"
            className="mt-4 inline-flex rounded-full bg-emerald-700 px-6 py-2 text-sm font-semibold text-white"
          >
            {tx("Sign in", "Dang nhap")}
          </Link>
        </div>
      ) : courses.length === 0 ? (
        <div className="surface-card rounded-3xl p-10 text-center text-sm text-emerald-800/70">
          {tx("No courses yet. Create your first course to get started.", "Chua co khoa hoc. Hay tao khoa hoc dau tien.")}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 stagger">
          {courses.map((course) => (
            <div key={course.id} className="surface-card rounded-3xl p-4">
              <img
                src={resolveApiAsset(course.thumbnailUrl) || "/images/learning.jpg"}
                alt={course.title}
                className="h-40 w-full rounded-2xl object-cover"
              />
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                    {course.category?.title ?? tx("Uncategorized", "Chua phan loai")}
                  </p>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                      course.isPublished
                        ? "bg-[color:var(--brand-soft)] text-emerald-900"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {course.isPublished ? tx("Published", "Da cong khai") : tx("Draft", "Ban nhap")}
                  </span>
                </div>
                <p className="text-lg font-semibold text-emerald-950">{course.title}</p>
                <p className="text-xs text-emerald-800/70">
                  {tx("Updated", "Cap nhat")}{" "}
                  {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : tx("Just now", "Vua xong")}
                </p>
                <Link
                  href={`/studio/${course.id}`}
                  className="inline-flex rounded-full border border-[color:var(--stroke)] px-4 py-2 text-xs font-semibold text-emerald-900"
                >
                  {tx("Edit course", "Sua khoa hoc")}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


