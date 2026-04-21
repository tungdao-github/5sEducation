"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { API_URL } from "@/lib/api";
import { notify } from "@/lib/notify";
import { useI18n } from "@/app/providers";

type PathSection = {
  id: number;
  learningPathId: number;
  title: string;
  description: string;
  sortOrder: number;
};

type PathCourse = {
  id: number;
  learningPathId: number;
  learningPathSectionId: number | null;
  courseId: number;
  courseTitle: string;
  courseSlug: string;
  sortOrder: number;
  isRequired: boolean;
};

type LearningPathDetail = {
  id: number;
  title: string;
  description: string;
  level: string;
  thumbnailUrl: string;
  estimatedHours: number;
  isPublished: boolean;
  sections: PathSection[];
  courses: PathCourse[];
};

type CourseOption = {
  id: number;
  title: string;
  slug: string;
};

export default function AdminPathDetailPage() {
  const { tx } = useI18n();
  const params = useParams();
  const pathId = Number(params?.id);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [path, setPath] = useState<LearningPathDetail | null>(null);
  const [allCourses, setAllCourses] = useState<CourseOption[]>([]);
  const [sectionForm, setSectionForm] = useState({
    title: "",
    description: "",
    sortOrder: 1,
  });
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [courseForm, setCourseForm] = useState({
    courseId: 0,
    sectionId: 0,
    sortOrder: 1,
    isRequired: true,
  });
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);

  const loadPath = async (token: string) => {
    const res = await fetch(`${API_URL}/api/admin/learning-paths/${pathId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setPath(await res.json());
    }
  };

  const loadCourses = async (token: string) => {
    const res = await fetch(`${API_URL}/api/instructor/courses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setAllCourses(
        (data as CourseOption[]).map((course) => ({
          id: course.id,
          title: course.title,
          slug: course.slug,
        }))
      );
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    if (!pathId) return;
    loadPath(token);
    loadCourses(token);
  }, [pathId]);

  const resetSectionForm = () => {
    setSectionForm({ title: "", description: "", sortOrder: 1 });
    setEditingSectionId(null);
  };

  const resetCourseForm = () => {
    setCourseForm({ courseId: 0, sectionId: 0, sortOrder: 1, isRequired: true });
    setEditingCourseId(null);
  };

  const handleSaveSection = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    if (!sectionForm.title.trim()) return;

    const payload = {
      title: sectionForm.title.trim(),
      description: sectionForm.description.trim(),
      sortOrder: Number(sectionForm.sortOrder) || 1,
    };

    const res = await fetch(
      editingSectionId
        ? `${API_URL}/api/admin/learning-paths/sections/${editingSectionId}`
        : `${API_URL}/api/admin/learning-paths/${pathId}/sections`,
      {
        method: editingSectionId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (res.ok) {
      notify({
        title: tx("Section saved", "Da luu chuong"),
        message: tx("Changes saved.", "Da luu thay doi."),
      });
      resetSectionForm();
      loadPath(token);
    }
  };

  const handleEditSection = (section: PathSection) => {
    setEditingSectionId(section.id);
    setSectionForm({
      title: section.title,
      description: section.description,
      sortOrder: section.sortOrder,
    });
  };

  const handleDeleteSection = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    const res = await fetch(`${API_URL}/api/admin/learning-paths/sections/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      notify({
        title: tx("Section removed", "Da xoa chuong"),
        message: tx("Section deleted.", "Da xoa chuong."),
      });
      loadPath(token);
    }
  };

  const handleSaveCourse = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    if (!courseForm.courseId) return;

    const payload = {
      courseId: courseForm.courseId,
      learningPathSectionId: courseForm.sectionId || null,
      sortOrder: Number(courseForm.sortOrder) || 1,
      isRequired: courseForm.isRequired,
    };

    const res = await fetch(
      editingCourseId
        ? `${API_URL}/api/admin/learning-paths/courses/${editingCourseId}`
        : `${API_URL}/api/admin/learning-paths/${pathId}/courses`,
      {
        method: editingCourseId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (res.ok) {
      notify({
        title: tx("Course saved", "Da luu khoa hoc"),
        message: tx("Changes saved.", "Da luu thay doi."),
      });
      resetCourseForm();
      loadPath(token);
    }
  };

  const handleEditCourse = (course: PathCourse) => {
    setEditingCourseId(course.id);
    setCourseForm({
      courseId: course.courseId,
      sectionId: course.learningPathSectionId ?? 0,
      sortOrder: course.sortOrder,
      isRequired: course.isRequired,
    });
  };

  const handleDeleteCourse = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    const res = await fetch(`${API_URL}/api/admin/learning-paths/courses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      notify({
        title: tx("Course removed", "Da xoa khoa hoc"),
        message: tx("Course removed from path.", "Da xoa khoa hoc khoi lo trinh."),
      });
      loadPath(token);
    }
  };

  const sectionOptions = useMemo(
    () => (path?.sections ?? []).sort((a, b) => a.sortOrder - b.sortOrder),
    [path]
  );

  if (needsAuth) {
    return (
      <div className="section-shell py-16 fade-in">
        <div className="surface-card rounded-3xl p-10 text-center">
          <p className="text-sm text-emerald-800/70">
            {tx("Admin access only.", "Chi danh cho quan tri vien.")}
          </p>
          <Link
            href={`/?auth=login&next=${encodeURIComponent(`/admin/paths/${pathId}`)}`}
            className="mt-4 inline-flex rounded-full bg-emerald-700 px-6 py-2 text-sm font-semibold text-white"
          >
            {tx("Sign in", "Dang nhap")}
          </Link>
        </div>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="section-shell py-16 text-sm text-emerald-800/70">
        {tx("Loading...", "Dang tai...")}
      </div>
    );
  }

  return (
    <div className="section-shell space-y-10 py-12 fade-in">
      <div className="space-y-2">
        <Link href="/admin" className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {tx("Admin", "Quan tri")}
        </Link>
        <h1 className="section-title text-3xl font-semibold text-emerald-950">{path.title}</h1>
        <p className="text-sm text-emerald-800/70">{path.description}</p>
      </div>

      <section className="surface-card space-y-6 rounded-3xl p-8">
        <div>
          <h2 className="section-title text-2xl font-semibold text-emerald-950">
            {tx("Sections", "Chuong")}
          </h2>
          <p className="text-sm text-emerald-800/70">
            {tx("Group courses into milestones.", "Nhom khoa hoc theo chuong.")}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <input
              value={sectionForm.title}
              onChange={(e) => setSectionForm((prev) => ({ ...prev, title: e.currentTarget.value }))}
              placeholder={tx("Section title", "Ten chuong")}
              className="w-full rounded-full border border-[color:var(--stroke)] bg-white px-4 py-2 text-sm"
            />
            <textarea
              value={sectionForm.description}
              onChange={(e) => setSectionForm((prev) => ({ ...prev, description: e.currentTarget.value }))}
              placeholder={tx("Description", "Mo ta")}
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
              rows={3}
            />
            <input
              type="number"
              value={sectionForm.sortOrder}
              onChange={(e) => setSectionForm((prev) => ({ ...prev, sortOrder: Number(e.currentTarget.value) }))}
              placeholder={tx("Sort order", "Thu tu")}
              className="w-full rounded-full border border-[color:var(--stroke)] bg-white px-4 py-2 text-sm"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSaveSection}
                className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white"
              >
                {editingSectionId ? tx("Save changes", "Luu thay doi") : tx("Add section", "Them chuong")}
              </button>
              {editingSectionId && (
                <button
                  type="button"
                  onClick={resetSectionForm}
                  className="rounded-full border border-[color:var(--stroke)] px-5 py-2 text-sm font-semibold text-emerald-900"
                >
                  {tx("Cancel", "Huy")}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {sectionOptions.map((section) => (
              <div
                key={section.id}
                className="flex flex-col gap-2 rounded-2xl border border-[color:var(--stroke)] bg-white/70 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-emerald-950">{section.title}</p>
                  <p className="text-xs text-emerald-800/70">{section.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditSection(section)}
                    className="rounded-full border border-[color:var(--stroke)] px-3 py-1 text-xs font-semibold text-emerald-900"
                  >
                    {tx("Edit", "Sua")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSection(section.id)}
                    className="rounded-full border border-[color:var(--stroke)] px-3 py-1 text-xs font-semibold text-emerald-900"
                  >
                    {tx("Delete", "Xoa")}
                  </button>
                </div>
              </div>
            ))}
            {sectionOptions.length === 0 && (
              <p className="text-sm text-emerald-800/70">{tx("No sections yet.", "Chua co chuong.")}</p>
            )}
          </div>
        </div>
      </section>

      <section className="surface-card space-y-6 rounded-3xl p-8">
        <div>
          <h2 className="section-title text-2xl font-semibold text-emerald-950">
            {tx("Courses in path", "Khoa hoc trong lo trinh")}
          </h2>
          <p className="text-sm text-emerald-800/70">
            {tx("Attach courses and set order.", "Gan khoa hoc va sap xep thu tu.")}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <select
              value={courseForm.courseId}
              onChange={(e) => setCourseForm((prev) => ({ ...prev, courseId: Number(e.currentTarget.value) }))}
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
            >
              <option value={0}>{tx("Select course", "Chon khoa hoc")}</option>
              {allCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            <select
              value={courseForm.sectionId}
              onChange={(e) => setCourseForm((prev) => ({ ...prev, sectionId: Number(e.currentTarget.value) }))}
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
            >
              <option value={0}>{tx("No section", "Khong co chuong")}</option>
              {sectionOptions.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.title}
                </option>
              ))}
            </select>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="number"
                value={courseForm.sortOrder}
                onChange={(e) => setCourseForm((prev) => ({ ...prev, sortOrder: Number(e.currentTarget.value) }))}
                placeholder={tx("Sort order", "Thu tu")}
                className="rounded-full border border-[color:var(--stroke)] bg-white px-4 py-2 text-sm"
              />
              <label className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
                <input
                  type="checkbox"
                  checked={courseForm.isRequired}
                  onChange={(e) => setCourseForm((prev) => ({ ...prev, isRequired: e.currentTarget.checked }))}
                />
                {tx("Required", "Bat buoc")}
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSaveCourse}
                className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white"
              >
                {editingCourseId ? tx("Save changes", "Luu thay doi") : tx("Add course", "Them khoa hoc")}
              </button>
              {editingCourseId && (
                <button
                  type="button"
                  onClick={resetCourseForm}
                  className="rounded-full border border-[color:var(--stroke)] px-5 py-2 text-sm font-semibold text-emerald-900"
                >
                  {tx("Cancel", "Huy")}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {path.courses.map((course) => (
              <div
                key={course.id}
                className="flex flex-col gap-2 rounded-2xl border border-[color:var(--stroke)] bg-white/70 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-emerald-950">{course.courseTitle}</p>
                  <p className="text-xs text-emerald-800/70">Slug: {course.courseSlug}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] text-emerald-800/70">
                  <span>{course.isRequired ? tx("Required", "Bat buoc") : tx("Optional", "Tuy chon")}</span>
                  <span>{tx("Order", "Thu tu")}: {course.sortOrder}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditCourse(course)}
                    className="rounded-full border border-[color:var(--stroke)] px-3 py-1 text-xs font-semibold text-emerald-900"
                  >
                    {tx("Edit", "Sua")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCourse(course.id)}
                    className="rounded-full border border-[color:var(--stroke)] px-3 py-1 text-xs font-semibold text-emerald-900"
                  >
                    {tx("Delete", "Xoa")}
                  </button>
                </div>
              </div>
            ))}
            {path.courses.length === 0 && (
              <p className="text-sm text-emerald-800/70">
                {tx("No courses linked yet.", "Chua co khoa hoc trong lo trinh.")}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

