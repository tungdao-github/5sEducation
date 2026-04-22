"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Check, Clock, Plus, ShoppingCart, Star, TrendingUp, Users, X } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { fetchCourses, fetchCoursesByIds, formatPrice, mapCourseCompare, mapCourseList } from "../data/api";
import { toast } from "@/figma/compat/sonner";
import { useLanguage } from "../contexts/LanguageContext";
import type { Course } from "../contexts/CartContext";

const MAX_COMPARE = 3;

export default function Compare() {
  const { language } = useLanguage();
  const { addToCart } = useCart();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchCourses({ pageSize: 60, sort: "popular" })
      .then((dtos) => {
        if (active) setAllCourses(dtos.map((dto) => mapCourseList(dto, language)));
      })
      .catch(() => {
        if (active) setAllCourses([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [language]);

  useEffect(() => {
    let active = true;
    if (selectedIds.length === 0) {
      setSelectedCourses([]);
      return () => {
        active = false;
      };
    }
    fetchCoursesByIds(selectedIds.map((id) => Number(id)))
      .then((dtos) => {
        if (active) setSelectedCourses(dtos.map((dto) => mapCourseCompare(dto, language)));
      })
      .catch(() => {
        if (active) setSelectedCourses([]);
      });
    return () => {
      active = false;
    };
  }, [language, selectedIds]);

  const availableCourses = useMemo(() => allCourses.filter((course) => !selectedIds.includes(course.id)), [allCourses, selectedIds]);

  const addCourse = (id: string) => {
    if (selectedIds.length >= MAX_COMPARE) {
      toast.warning(`Chỉ so sánh tối đa ${MAX_COMPARE} khóa học`);
      return;
    }
    if (selectedIds.includes(id)) {
      toast.info("Khóa học đã được chọn");
      return;
    }
    setSelectedIds((current) => [...current, id]);
    setShowPicker(false);
  };

  const removeCourse = (id: string) => setSelectedIds((current) => current.filter((entry) => entry !== id));

  const compareRows: { label: string; key: keyof Course; render?: (value: any) => React.ReactNode }[] = [
    { label: "Giá", key: "price", render: (value: number) => <span className="font-semibold text-blue-600">{formatPrice(value)}</span> },
    { label: "Giá gốc", key: "originalPrice", render: (value: number | undefined) => (value ? <span className="text-slate-400 line-through">{formatPrice(value)}</span> : "—") },
    { label: "Đánh giá", key: "rating", render: (value: number) => <span className="inline-flex items-center gap-1"><Star className="size-4 fill-amber-400 text-amber-400" />{value}/5</span> },
    { label: "Học viên", key: "students", render: (value: number) => <span className="inline-flex items-center gap-1"><Users className="size-4 text-slate-400" />{value.toLocaleString()}</span> },
    { label: "Thời lượng", key: "duration", render: (value: string) => <span className="inline-flex items-center gap-1"><Clock className="size-4 text-slate-400" />{value}</span> },
    { label: "Số bài học", key: "lessons", render: (value: number) => <span className="inline-flex items-center gap-1"><BookOpen className="size-4 text-slate-400" />{value} bài</span> },
    { label: "Cấp độ", key: "level", render: (value: string) => <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{value}</span> },
    { label: "Danh mục", key: "category" },
    { label: "Giảng viên", key: "instructor" },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <section className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"><ArrowLeft className="size-4" />Quay lại</Link>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"><TrendingUp className="size-3.5" />So sánh khóa học</div>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-4xl">Chọn khóa học phù hợp nhất</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">So sánh tối đa {MAX_COMPARE} khóa học theo giá, thời lượng, cấp độ và kết quả học tập.</p>
            </div>
            <div className="flex gap-2"><StatChip label="Đang so sánh" value={selectedCourses.length} /><StatChip label="Khóa học khả dụng" value={allCourses.length} /></div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? <div className="rounded-[24px] border border-slate-200 bg-white py-20 text-center text-slate-500 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">Đang tải danh sách khóa học...</div> : selectedCourses.length === 0 ? <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-[0_16px_50px_rgba(15,23,42,0.08)]"><div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-blue-50 text-blue-600"><TrendingUp className="size-10" /></div><h2 className="text-xl font-semibold text-slate-950">Chưa có khóa học nào để so sánh</h2><p className="mt-2 text-sm text-slate-500">Chọn vài khóa học để nhìn thấy khác biệt rõ ràng hơn.</p><button onClick={() => setShowPicker(true)} className="mt-6 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Chọn khóa học</button></div> : <div className="space-y-8"><div className="grid gap-4 xl:grid-cols-[1fr_auto]"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{selectedCourses.map((course) => <article key={course.id} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08)]"><div className="relative h-40 bg-slate-100"><img src={course.image} alt={course.title} className="h-full w-full object-cover" /><button onClick={() => removeCourse(course.id)} className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm transition hover:text-red-600"><X className="size-4" /></button></div><div className="space-y-4 p-5"><div><Link href={`/courses/${course.slug ?? course.id}`} className="text-lg font-semibold tracking-[-0.02em] text-slate-950 transition hover:text-blue-600">{course.title}</Link><p className="mt-1 text-sm text-slate-500">{course.instructor}</p></div><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-blue-50 px-4 py-3"><p className="text-xs text-blue-700">Giá</p><p className="text-lg font-semibold text-blue-700">{formatPrice(course.price)}</p></div><div className="rounded-2xl bg-slate-50 px-4 py-3"><p className="text-xs text-slate-500">Đánh giá</p><p className="text-lg font-semibold text-slate-950">{course.rating}★</p></div></div><button onClick={() => { void addToCart(course); toast.success("Đã thêm vào giỏ hàng"); }} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"><ShoppingCart className="size-4" />Thêm vào giỏ</button></div></article>)}{selectedCourses.length < MAX_COMPARE ? <button onClick={() => setShowPicker(true)} className="group flex min-h-[420px] items-center justify-center rounded-[28px] border-2 border-dashed border-slate-300 bg-white/70 p-6 text-slate-500 transition hover:border-blue-400 hover:bg-blue-50/60 hover:text-blue-600"><div className="text-center"><div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full border border-current bg-white"><Plus className="size-7" /></div><p className="text-base font-semibold">Thêm khóa học</p><p className="mt-1 text-sm">Còn {MAX_COMPARE - selectedCourses.length} chỗ</p></div></button> : null}</div></div><div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08)]"><div className="border-b border-slate-200 px-5 py-4"><h2 className="text-lg font-semibold text-slate-950">So sánh chi tiết</h2><p className="text-sm text-slate-500">Các tiêu chí chính để ra quyết định nhanh hơn.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[880px] border-collapse"><tbody>{compareRows.map((row, index) => <tr key={String(row.key)} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/70"}><td className="w-48 px-5 py-4 text-sm font-semibold text-slate-700">{row.label}</td>{selectedCourses.map((course) => <td key={course.id} className="px-5 py-4 text-center text-sm text-slate-700">{row.render ? row.render(course[row.key]) : String(course[row.key])}</td>)}{selectedCourses.length < MAX_COMPARE ? <td className="px-5 py-4" /> : null}</tr>)}<tr className="bg-white"><td className="px-5 py-4 text-sm font-semibold text-slate-700">Bạn sẽ học được</td>{selectedCourses.map((course) => <td key={course.id} className="px-5 py-4 align-top">{course.learningOutcomes.length > 0 ? <ul className="space-y-2 text-left text-sm text-slate-600">{course.learningOutcomes.map((outcome, index) => <li key={index} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-emerald-500" /><span>{outcome}</span></li>)}</ul> : <p className="text-sm text-slate-400">Đang cập nhật</p>}</td>)}{selectedCourses.length < MAX_COMPARE ? <td className="px-5 py-4" /> : null}</tr></tbody></table></div></div></div>}

        {showPicker ? <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><button className="absolute inset-0 bg-slate-950/60" onClick={() => setShowPicker(false)} aria-label="Đóng" /><div className="relative w-full max-w-3xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.28)]"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h3 className="text-lg font-semibold text-slate-950">Chọn khóa học để so sánh</h3><p className="text-sm text-slate-500">Chỉ chọn tối đa {MAX_COMPARE} khóa học.</p></div><button onClick={() => setShowPicker(false)} className="inline-flex size-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"><X className="size-5" /></button></div><div className="max-h-[70vh] overflow-y-auto p-5"><div className="grid gap-3 sm:grid-cols-2">{availableCourses.map((course) => <button key={course.id} onClick={() => addCourse(course.id)} className="flex items-start gap-3 rounded-2xl border border-slate-200 p-3 text-left transition hover:border-blue-300 hover:bg-blue-50/60"><img src={course.image} alt={course.title} className="h-14 w-20 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-semibold text-slate-950">{course.title}</p><p className="mt-0.5 text-xs text-slate-500">{course.instructor}</p><p className="mt-1 text-xs font-semibold text-blue-600">{formatPrice(course.price)}</p></div></button>)}</div></div></div></div> : null}

        {selectedCourses.length > 0 && selectedCourses.length < MAX_COMPARE && !showPicker ? <div className="mt-8 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)]"><div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-950">Thêm khóa học để so sánh</h2><p className="text-sm text-slate-500">Chọn thêm tối đa {MAX_COMPARE - selectedCourses.length} khóa học.</p></div><button onClick={() => setShowPicker(true)} className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">Mở danh sách</button></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{availableCourses.slice(0, 4).map((course) => <button key={course.id} onClick={() => addCourse(course.id)} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-blue-300 hover:bg-blue-50/60"><img src={course.image} alt={course.title} className="mb-3 h-20 w-full rounded-xl object-cover" /><p className="line-clamp-2 text-sm font-semibold text-slate-950">{course.title}</p><p className="mt-1 text-xs text-slate-500">{course.instructor}</p><div className="mt-3 inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white"><Plus className="size-3.5" />So sánh</div></button>)}</div></div> : null}
      </div>
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"><p className="text-xs text-slate-500">{label}</p><p className="text-lg font-semibold text-slate-950">{value}</p></div>;
}
