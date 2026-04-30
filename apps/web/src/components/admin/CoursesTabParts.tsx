"use client";

import { ChevronDown, ChevronUp, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useI18n } from "@/app/providers";
import { Link } from "@/lib/router";
import { resolveApiAsset } from "@/lib/api";
import { formatPrice, formatPriceCompact, type CourseManageDto } from "@/services/api";
import { toIntlLocale } from "@/components/admin/adminLocale";

export function CoursesSearchBar({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}) {
  const { tx } = useI18n();

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder={tx("Search courses, instructors, categories...", "Tìm kiếm khóa học, giảng viên, danh mục...")}
          className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <Link
        to="/admin/courses/new"
        className="flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        <Plus className="size-4" /> {tx("Add course", "Thêm khóa học")}
      </Link>
    </div>
  );
}

export function CoursesSummaryCards({ courses }: { courses: CourseManageDto[] }) {
  const { tx, locale } = useI18n();
  const totalStudents = courses.reduce((sum, course) => sum + course.studentCount, 0);
  const avgRating = courses.length ? (courses.reduce((sum, course) => sum + course.averageRating, 0) / courses.length).toFixed(1) : "0.0";
  const avgPrice = courses.length ? formatPriceCompact(courses.reduce((sum, course) => sum + course.price, 0) / courses.length) : formatPriceCompact(0);

  const cards = [
    { label: tx("Courses", "Tổng khóa học"), value: courses.length, color: "blue" },
    { label: tx("Students", "Học viên"), value: totalStudents.toLocaleString(toIntlLocale(locale)), color: "green" },
    { label: tx("Avg rating", "Đánh giá TB"), value: `${avgRating}★`, color: "yellow" },
    { label: tx("Avg price", "Giá TB"), value: avgPrice, color: "purple" },
  ];

  return (
    <div className="mb-5 grid grid-cols-4 gap-3">
      {cards.map((stat) => (
        <div key={stat.label} className={`rounded-lg bg-${stat.color}-50 p-3 text-center`}>
          <p className={`font-bold text-${stat.color}-700`}>{stat.value}</p>
          <p className="mt-0.5 text-xs text-gray-500">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

function CoursesItem({
  course,
  expanded,
  onToggle,
  onDelete,
}: {
  course: CourseManageDto;
  expanded: boolean;
  onToggle: () => void;
  onDelete: (course: CourseManageDto) => Promise<void>;
}) {
  const { tx, locale } = useI18n();
  const instructorName = course.instructorName ?? tx("Updating", "Đang cập nhật");

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 transition hover:border-blue-200">
      <div className="flex cursor-pointer items-center gap-4 p-4 transition hover:bg-gray-50" onClick={onToggle}>
        <img src={resolveApiAsset(course.thumbnailUrl)} alt={course.title} className="h-12 w-16 flex-shrink-0 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-gray-900">{course.title}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span>{instructorName}</span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">{course.category?.title ?? tx("Other", "Khác")}</span>
            <span>{course.studentCount.toLocaleString(toIntlLocale(locale))} {tx("students", "học viên")}</span>
            <span className="text-yellow-600">{course.averageRating.toFixed(1)}★</span>
            <span className="font-semibold text-blue-600">{formatPriceCompact(course.price)}</span>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1">
          <Link
            to={`/courses/${course.slug}`}
            className="rounded p-1.5 text-blue-600 transition hover:bg-blue-50"
            onClick={(event) => event.stopPropagation()}
          >
            <Eye className="size-4" />
          </Link>
          <Link
            to={`/admin/courses/edit/${course.id}`}
            className="rounded p-1.5 text-gray-600 transition hover:bg-gray-100"
            onClick={(event) => event.stopPropagation()}
          >
            <Pencil className="size-4" />
          </Link>
          <button
            type="button"
            className="rounded p-1.5 text-red-500 transition hover:bg-red-50"
            onClick={(event) => {
              event.stopPropagation();
              void onDelete(course);
            }}
          >
            <Trash2 className="size-4" />
          </button>
          {expanded ? <ChevronUp className="size-4 text-gray-400" /> : <ChevronDown className="size-4 text-gray-400" />}
        </div>
      </div>

      {expanded ? (
        <div className="border-t border-gray-100 bg-gray-50 p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="mb-1 text-xs text-gray-500">{tx("Description", "Mô tả")}</p>
              <p className="text-sm text-gray-700">
                {course.category?.title ? tx(`This course belongs to ${course.category.title}.`, `Khóa học thuộc danh mục ${course.category.title}.`) : tx("No detailed description yet.", "Chưa có mô tả chi tiết cho khóa học.")}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-500">{tx("Info", "Thông tin")}</p>
              <div className="space-y-1 text-sm text-gray-700">
                <p>⏱ {course.totalLessons} {tx("lessons", "bài học")}</p>
                <p>📊 {course.level}</p>
                <p>💰 {formatPrice(course.price)} · {tx("Revenue", "Doanh thu")} {formatPrice(course.revenue ?? 0)}</p>
              </div>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-500">{tx("Updated", "Cập nhật")}</p>
              <p className="text-sm text-gray-700">{course.updatedAt ? new Date(course.updatedAt).toLocaleDateString(toIntlLocale(locale)) : tx("Recently", "Gần đây")}</p>
              <p className="mt-2 text-xs text-gray-500">{tx("Reviews", "Review")}: {course.reviewCount} {tx("times", "lượt")}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function CoursesList({
  courses,
  expandedCourse,
  setExpandedCourse,
  onDelete,
}: {
  courses: CourseManageDto[];
  expandedCourse: number | null;
  setExpandedCourse: (value: number | null) => void;
  onDelete: (course: CourseManageDto) => Promise<void>;
}) {
  return (
    <div className="space-y-3">
      {courses.map((course) => (
        <CoursesItem
          key={course.id}
          course={course}
          expanded={expandedCourse === course.id}
          onToggle={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export function CoursesEmptyState() {
  const { tx } = useI18n();
  return <div className="py-12 text-center text-gray-400">{tx("No courses found.", "Không tìm thấy khóa học nào")}</div>;
}
