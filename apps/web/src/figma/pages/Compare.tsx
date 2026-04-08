"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/figma/compat/router";
import { X, Plus, Check, Star, Clock, BookOpen, Users, TrendingUp, ShoppingCart, ArrowLeft } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { toast } from "@/figma/compat/sonner";
import type { Course } from "../contexts/CartContext";
import { fetchCourses, fetchCoursesByIds, mapCourseCompare, mapCourseList, formatPrice } from "../data/api";
import { useLanguage } from "../contexts/LanguageContext";

const MAX_COMPARE = 3;

export default function Compare() {
  const { language } = useLanguage();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchCourses({ pageSize: 60, sort: "popular" })
      .then((dtos) => {
        if (!active) return;
        setAllCourses(dtos.map((dto) => mapCourseList(dto, language)));
      })
      .catch(() => {
        if (!active) return;
        setAllCourses([]);
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
        if (!active) return;
        setSelectedCourses(dtos.map((dto) => mapCourseCompare(dto, language)));
      })
      .catch(() => {
        if (!active) return;
        setSelectedCourses([]);
      });

    return () => {
      active = false;
    };
  }, [selectedIds, language]);

  const addCourse = (id: string) => {
    if (selectedIds.length >= MAX_COMPARE) {
      toast.warning(`Chỉ so sánh tối đa ${MAX_COMPARE} khóa học`);
      return;
    }
    if (selectedIds.includes(id)) {
      toast.info("Khóa học đã được chọn");
      return;
    }
    setSelectedIds((prev) => [...prev, id]);
    setShowPicker(false);
  };

  const removeCourse = (id: string) => setSelectedIds((prev) => prev.filter((i) => i !== id));

  const compareRows: { label: string; key: keyof Course; render?: (v: any) => React.ReactNode }[] = [
    { label: "Giá", key: "price", render: (v: number) => <span className="font-bold text-blue-600">{formatPrice(v)}</span> },
    {
      label: "Giá gốc",
      key: "originalPrice",
      render: (v: number) => (v ? <span className="line-through text-gray-400">{formatPrice(v)}</span> : "—"),
    },
    { label: "Đánh giá", key: "rating", render: (v: number) => <span className="flex items-center gap-1 justify-center"><Star className="size-4 text-yellow-400 fill-yellow-400" />{v}/5</span> },
    { label: "Học viên", key: "students", render: (v: number) => <span className="flex items-center gap-1 justify-center"><Users className="size-4 text-gray-400" />{v.toLocaleString()}</span> },
    { label: "Thời lượng", key: "duration", render: (v: string) => <span className="flex items-center gap-1 justify-center"><Clock className="size-4 text-gray-400" />{v}</span> },
    { label: "Số bài học", key: "lessons", render: (v: number) => <span className="flex items-center gap-1 justify-center"><BookOpen className="size-4 text-gray-400" />{v} bài</span> },
    { label: "Cấp độ", key: "level", render: (v: string) => <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{v}</span> },
    { label: "Danh mục", key: "category" },
    { label: "Giảng viên", key: "instructor" },
  ];

  const availableCourses = useMemo(
    () => allCourses.filter((course) => !selectedIds.includes(course.id)),
    [allCourses, selectedIds]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-4 transition">
            <ArrowLeft className="size-4" />Quay lại
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">So sánh khóa học</h1>
              <p className="text-gray-500 text-sm mt-1">So sánh tối đa {MAX_COMPARE} khóa học để chọn phù hợp nhất</p>
            </div>
            {selectedIds.length > 0 && (
              <button onClick={() => setSelectedIds([])} className="text-sm text-red-500 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                Xóa tất cả
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-20 text-gray-500">Đang tải danh sách khóa học...</div>
        ) : selectedCourses.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20">
            <div className="size-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="size-10 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Chưa có khóa học nào để so sánh</h2>
            <p className="text-gray-500 mb-6">Chọn khóa học bên dưới để bắt đầu so sánh</p>
            <button onClick={() => setShowPicker(true)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition">
              Chọn khóa học
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              {/* Course Cards Row */}
              <thead>
                <tr>
                  <th className="w-40 text-left align-bottom pb-4 pr-4">
                    <span className="text-sm font-medium text-gray-500">Tiêu chí</span>
                  </th>
                  {selectedCourses.map((course) => (
                    <th key={course.id} className="min-w-[220px] px-3 pb-4 align-top">
                      <div className="bg-white rounded-xl border border-gray-200 p-4 relative shadow-sm">
                        <button
                          onClick={() => removeCourse(course.id)}
                          className="absolute top-2 right-2 size-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-200 transition"
                        >
                          <X className="size-3.5" />
                        </button>
                        <Link to={`/course/${course.slug ?? course.id}`}>
                          <img src={course.image} alt={course.title} className="w-full h-28 object-cover rounded-lg mb-3" />
                          <h3 className="font-semibold text-gray-900 text-sm text-left line-clamp-2 mb-2 hover:text-blue-600 transition">{course.title}</h3>
                        </Link>
                        <p className="text-xs text-gray-500 text-left mb-3">{course.instructor}</p>
                        <button
                          onClick={() => { addToCart(course); toast.success("Đã thêm vào giỏ hàng!"); }}
                          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                        >
                          <ShoppingCart className="size-4" />Thêm vào giỏ
                        </button>
                      </div>
                    </th>
                  ))}
                  {selectedCourses.length < MAX_COMPARE && (
                    <th className="min-w-[220px] px-3 pb-4 align-top">
                      <button
                        onClick={() => setShowPicker(true)}
                        className="w-full h-[220px] rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-blue-500"
                      >
                        <div className="size-12 rounded-full border-2 border-dashed border-current flex items-center justify-center">
                          <Plus className="size-6" />
                        </div>
                        <span className="text-sm font-medium">Thêm khóa học</span>
                        <span className="text-xs">({MAX_COMPARE - selectedCourses.length} chỗ còn lại)</span>
                      </button>
                    </th>
                  )}
                </tr>
              </thead>
              {/* Comparison Rows */}
              <tbody>
                {compareRows.map((row, rowIdx) => (
                  <tr key={row.key} className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-3.5 pr-4">
                      <span className="text-sm font-semibold text-gray-700">{row.label}</span>
                    </td>
                    {selectedCourses.map((course) => (
                      <td key={course.id} className="py-3.5 px-3 text-center">
                        <span className="text-sm text-gray-700">
                          {row.render ? row.render(course[row.key]) : String(course[row.key])}
                        </span>
                      </td>
                    ))}
                    {selectedCourses.length < MAX_COMPARE && <td />}
                  </tr>
                ))}
                {/* Learning Outcomes */}
                <tr className="bg-white">
                  <td className="py-4 pr-4 align-top">
                    <span className="text-sm font-semibold text-gray-700">Bạn sẽ học được</span>
                  </td>
                  {selectedCourses.map((course) => (
                    <td key={course.id} className="py-4 px-3 align-top">
                      {course.learningOutcomes.length > 0 ? (
                        <ul className="space-y-1.5 text-left">
                          {course.learningOutcomes.map((outcome, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                              <Check className="size-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                              {outcome}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-400 text-left">Đang cập nhật</p>
                      )}
                    </td>
                  ))}
                  {selectedCourses.length < MAX_COMPARE && <td />}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Course Picker Modal */}
        {showPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowPicker(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Chọn khóa học để so sánh</h3>
                  <button onClick={() => setShowPicker(false)} className="text-gray-400 hover:text-gray-600"><X className="size-5" /></button>
                </div>
              </div>
              <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  {availableCourses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => addCourse(course.id)}
                      className="flex items-start gap-3 p-3 text-left border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition group"
                    >
                      <img src={course.image} alt={course.title} className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition line-clamp-2">{course.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{course.instructor}</p>
                        <p className="text-xs font-bold text-blue-600 mt-1">{formatPrice(course.price)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Courses Quick Add */}
        {selectedCourses.length > 0 && selectedCourses.length < MAX_COMPARE && !showPicker && (
          <div className="mt-8">
            <h2 className="font-semibold text-gray-900 mb-4">Thêm khóa học để so sánh</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {availableCourses.slice(0, 4).map((course) => (
                <div key={course.id} className="bg-white rounded-xl border border-gray-200 p-3 hover:border-blue-300 transition">
                  <img src={course.image} alt={course.title} className="w-full h-20 object-cover rounded-lg mb-2" />
                  <p className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">{course.title}</p>
                  <p className="text-xs text-gray-500 mb-2">{formatPrice(course.price)}</p>
                  <button
                    onClick={() => addCourse(course.id)}
                    className="w-full text-xs bg-blue-600 text-white py-1.5 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-1"
                  >
                    <Plus className="size-3" />So sánh
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
