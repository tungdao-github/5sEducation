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
    {
      label: tx("Price", "Gia"),
      render: (c: CourseCompareDto) => {
        const effective = c.effectivePrice ?? c.price;
        const original = c.originalPrice ?? null;
        const isFlashSale = Boolean(c.isFlashSaleActive && original);
        return (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-emerald-950">{formatPrice(effective)}</span>
            {isFlashSale && original ? (
              <span className="text-[11px] font-semibold text-emerald-700/60 line-through">
                {formatPrice(original)}
              </span>
            ) : null}
            {isFlashSale && c.flashSaleEndsAt ? (
              <span className="text-[11px] text-emerald-700/70">
                {tx("Ends", "Ket thuc")}: {new Date(c.flashSaleEndsAt).toLocaleString()}
              </span>
            ) : null}
          </div>
        );
      },
    },
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
  const courseCount = courses.length;
  const averageRating =
    courses.length > 0
      ? courses.reduce((sum, item) => sum + (item.averageRating || 0), 0) / courses.length
      : 0;
  const averagePrice =
    courses.length > 0
      ? courses.reduce((sum, item) => sum + (item.effectivePrice ?? item.price ?? 0), 0) / courses.length
      : 0;

  return (
    <div className="section-shell space-y-10 py-12 fade-in">
      <div className="space-y-3">
        <Link href="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {tx("Home", "Trang chu")}
        </Link>
        <h1 className="section-title text-4xl font-semibold text-emerald-950">
          {tx("Compare courses", "So sanh khoa hoc")}
        </h1>
        <p className="text-sm text-emerald-800/70">
          {tx(
            "Compare up to 3 courses side by side to pick the best fit.",
            "So sanh toi da 3 khoa hoc de chon lua phu hop."
          )}
        </p>
        <div className="flex flex-wrap gap-3 text-sm text-emerald-800/70">
          <div className="stat-pill">
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-emerald-700">
              {tx("Selected", "Da chon")}
            </span>
            <span className="text-sm font-semibold text-emerald-950">{courseCount}</span>
          </div>
          <div className="stat-pill">
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-emerald-700">
              {tx("Avg rating", "Danh gia TB")}
            </span>
            <span className="text-sm font-semibold text-emerald-950">
              {courseCount ? averageRating.toFixed(1) : "-"}
            </span>
          </div>
          <div className="stat-pill">
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-emerald-700">
              {tx("Avg price", "Gia TB")}
            </span>
            <span className="text-sm font-semibold text-emerald-950">
              {courseCount ? formatPrice(averagePrice) : "-"}
            </span>
          </div>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="surface-card p-10 text-center text-sm text-emerald-800/70">
          {tx("No courses selected. Use Compare on a course card.", "Chua co khoa hoc nao. Hay bam So sanh tren the khoa hoc.")}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                {tx("Comparison table", "Bang so sanh")}
              </p>
              <p className="text-sm text-emerald-800/70">
                {tx("Scan differences by row.", "Quet nhanh theo tung dong thong tin.")}
              </p>
            </div>
            <button
              type="button"
              onClick={clearAll}
              className="rounded-full border border-[color:var(--stroke)] px-4 py-2 text-xs font-semibold text-emerald-900"
            >
              {tx("Clear all", "Xoa tat ca")}
            </button>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-[color:var(--stroke)] bg-white/80">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[220px_repeat(3,1fr)] gap-0 border-b border-[color:var(--stroke)]">
                <div className="p-4 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  {tx("Course", "Khoa hoc")}
                </div>
                {courses.map((course) => (
                  <div key={course.id} className="p-4">
                    <div className="flex flex-col gap-3">
                      <img
                        src={resolveApiAsset(course.thumbnailUrl) || "/images/learning.jpg"}
                        alt={course.title}
                        className="h-28 w-full rounded-2xl object-cover"
                      />
                      <div className="space-y-1">
                        <Link href={`/courses/${course.slug}`} className="text-sm font-semibold text-emerald-950">
                          {course.title}
                        </Link>
                        <p className="text-xs text-emerald-800/70">{course.shortDescription}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => remove(course.id)}
                          className="rounded-full border border-[color:var(--stroke)] px-3 py-1 text-[11px] font-semibold text-emerald-900"
                        >
                          {tx("Remove", "Xoa")}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {rows.map((row) => (
                <div key={row.label} className="grid grid-cols-[220px_repeat(3,1fr)] border-b border-[color:var(--stroke)]">
                  <div className="p-4 text-xs font-semibold text-emerald-900">{row.label}</div>
                  {courses.map((course) => (
                    <div key={course.id} className="p-4 text-xs text-emerald-800/80">
                      {row.render(course)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

