"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_URL, resolveApiAsset } from "@/lib/api";
import { useI18n } from "@/app/providers";
import { COMPARE_EVENT, readCompareIds, writeCompareIds } from "@/lib/compare";

interface CourseCompareDto {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  outcome: string;
  requirements: string;
  price: number;
  effectivePrice: number;
  originalPrice?: number | null;
  isFlashSaleActive?: boolean;
  flashSaleEndsAt?: string | null;
  thumbnailUrl: string;
  language: string;
  level: string;
  averageRating: number;
  reviewCount: number;
  studentCount: number;
  category?: {
    id: number;
    title: string;
    slug: string;
  } | null;
}

export default function ComparePage() {
  const { tx } = useI18n();
  const [ids, setIds] = useState<number[]>([]);
  const [courses, setCourses] = useState<CourseCompareDto[]>([]);

  const formatPrice = (price: number) => {
    if (price <= 0) {
      return tx("Free", "Mien phi");
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  useEffect(() => {
    const sync = () => setIds(readCompareIds());
    sync();
    window.addEventListener(COMPARE_EVENT, sync);
    return () => window.removeEventListener(COMPARE_EVENT, sync);
  }, []);

  useEffect(() => {
    const load = async () => {
      if (ids.length === 0) {
        setCourses([]);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/courses/compare?ids=${ids.join(",")}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = (await res.json()) as CourseCompareDto[];
          setCourses(data);
        }
      } catch {
        setCourses([]);
      }
    };

    load();
  }, [ids]);

  const remove = (id: number) => {
    writeCompareIds(ids.filter((item) => item !== id));
  };

  const clearAll = () => {
    writeCompareIds([]);
  };

  const rows = [
    { label: tx("Price", "Gia"), render: (c: CourseCompareDto) => formatPrice(c.effectivePrice ?? c.price) },
    { label: tx("Level", "Cap do"), render: (c: CourseCompareDto) => c.level || "-" },
    { label: tx("Language", "Ngon ngu"), render: (c: CourseCompareDto) => c.language || "-" },
    {
      label: tx("Rating", "Danh gia"),
      render: (c: CourseCompareDto) => `${c.averageRating.toFixed(1)} (${c.reviewCount})`,
    },
    { label: tx("Students", "Hoc vien"), render: (c: CourseCompareDto) => `${c.studentCount}` },
    { label: tx("Category", "Danh muc"), render: (c: CourseCompareDto) => c.category?.title || "-" },
    { label: tx("Outcome", "Ket qua"), render: (c: CourseCompareDto) => c.outcome || "-" },
    { label: tx("Requirements", "Yeu cau"), render: (c: CourseCompareDto) => c.requirements || "-" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{tx("Compare courses", "So sanh khoa hoc")}</h1>
            <p className="text-sm text-gray-500 mt-2">
              {tx("Compare up to 3 courses side by side.", "So sanh toi da 3 khoa hoc.")}
            </p>
          </div>
          {courses.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              {tx("Clear all", "Xoa tat ca")}
            </button>
          )}
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500">
            {tx("No courses selected yet.", "Chua co khoa hoc nao duoc chon.")}
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[220px_repeat(3,1fr)] border-b border-gray-200">
                <div className="p-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  {tx("Course", "Khoa hoc")}
                </div>
                {courses.map((course) => (
                  <div key={course.id} className="p-4">
                    <div className="flex flex-col gap-3">
                      <img
                        src={resolveApiAsset(course.thumbnailUrl) || "/images/learning.jpg"}
                        alt={course.title}
                        className="h-28 w-full rounded-xl object-cover"
                      />
                      <div className="space-y-1">
                        <Link href={`/courses/${course.slug}`} className="text-sm font-semibold text-gray-900">
                          {course.title}
                        </Link>
                        <p className="text-xs text-gray-500 line-clamp-2">{course.shortDescription}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(course.id)}
                        className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                      >
                        {tx("Remove", "Xoa")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {rows.map((row) => (
                <div key={row.label} className="grid grid-cols-[220px_repeat(3,1fr)] border-b border-gray-200">
                  <div className="p-4 text-xs font-semibold text-gray-700">{row.label}</div>
                  {courses.map((course) => (
                    <div key={course.id} className="p-4 text-xs text-gray-600">
                      {row.render(course)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-sm text-gray-500">
          {tx("Tip: use Compare on any course card.", "Meo: bam So sanh tren the khoa hoc.")}
        </div>
      </div>
    </div>
  );
}
