"use client";

import { useI18n } from "@/app/providers";
import CompareHeader from "@/components/compare/CompareHeader";
import CompareEmptyState from "@/components/compare/CompareEmptyState";
import CompareSelectedGrid from "@/components/compare/CompareSelectedGrid";
import CompareTable from "@/components/compare/CompareTable";
import ComparePickerModal from "@/components/compare/ComparePickerModal";
import { useComparePage } from "@/components/compare/useComparePage";

export default function Compare() {
  const compare = useComparePage();
  const { tx } = useI18n();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <CompareHeader selectedCount={compare.selectedCourses.length} totalCount={compare.allCourses.length} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {compare.loading ? (
          <div className="rounded-[24px] border border-slate-200 bg-white py-20 text-center text-slate-500 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
            {tx("Loading course list...", "Đang tải danh sách khóa học...")}
          </div>
        ) : compare.selectedCourses.length === 0 ? (
          <CompareEmptyState onOpenPicker={() => compare.setShowPicker(true)} />
        ) : (
          <div className="space-y-8">
            <CompareSelectedGrid
              selectedCourses={compare.selectedCourses}
              maxCompare={compare.maxCompare}
              onRemove={compare.removeCourse}
              onAddToCart={(course) => {
                void compare.addToCart(course);
              }}
              onOpenPicker={() => compare.setShowPicker(true)}
            />
            <CompareTable selectedCourses={compare.selectedCourses} />
          </div>
        )}

        {compare.selectedCourses.length > 0 && compare.selectedCourses.length < compare.maxCompare && !compare.showPicker ? (
          <div className="mt-8 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">{tx("Add courses to compare", "Thêm khóa học để so sánh")}</h2>
                <p className="text-sm text-slate-500">
                  {tx("Choose up to", "Chọn thêm tối đa")} {compare.maxCompare - compare.selectedCourses.length} {tx("more courses", "khóa học")}
                </p>
              </div>
              <button
                onClick={() => compare.setShowPicker(true)}
                className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {tx("Open list", "Mở danh sách")}
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {compare.availableCourses.slice(0, 4).map((course) => (
                <button
                  key={course.id}
                  onClick={() => compare.addCourse(course)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-blue-300 hover:bg-blue-50/60"
                >
                  <img src={course.image} alt={course.title} className="mb-3 h-20 w-full rounded-xl object-cover" />
                  <p className="line-clamp-2 text-sm font-semibold text-slate-950">{course.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{course.instructor}</p>
                  <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                    {tx("Compare", "So sánh")}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <ComparePickerModal
          open={compare.showPicker}
          courses={compare.availableCourses}
          maxCompare={compare.maxCompare}
          onClose={() => compare.setShowPicker(false)}
          onPick={compare.addCourse}
        />
      </div>
    </div>
  );
}
