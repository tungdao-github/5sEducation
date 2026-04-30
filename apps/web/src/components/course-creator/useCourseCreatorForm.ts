"use client";

import { useEffect, useMemo, useState } from "react";
import { getCourseCategories } from "@/data/courses";
import { uploadLocalVideo } from "@/data/api";
import { resolveApiAsset } from "@/lib/api";
import { toast } from "@/lib/notify";
import { type CurriculumLesson, type CurriculumSection, type InstructorCourse } from "@/contexts/InstructorContext";
import { useI18n } from "@/app/providers";

type DraftCourse = Partial<InstructorCourse>;

function createSectionDraft(): CurriculumSection {
  return {
    id: `section-${Date.now()}`,
    title: "",
    duration: "",
    lessons: [],
  };
}

function createLessonDraft(): CurriculumLesson {
  return {
    id: `lesson-${Date.now()}`,
    title: "",
    duration: "",
    type: "video",
    free: false,
  };
}

type Params = {
  onCreateCourse: (course: Omit<InstructorCourse, "id" | "numericId" | "createdAt" | "students" | "rating" | "revenue">) => Promise<{ success: boolean; message: string }>;
  onSuccessNavigate: () => void;
};

export function useCourseCreatorForm({ onCreateCourse, onSuccessNavigate }: Params) {
  const { locale, tx } = useI18n();
  const categories = useMemo(() => getCourseCategories(locale), [locale]);
  const levels = useMemo(() => [tx("Beginner", "Cơ bản"), tx("Intermediate", "Trung cấp"), tx("Advanced", "Nâng cao")], [tx]);
  const [loading, setLoading] = useState(false);
  const [previewVideoUploading, setPreviewVideoUploading] = useState(false);
  const [formData, setFormData] = useState<DraftCourse>({
    title: "",
    description: "",
    category: categories.find((item) => item !== tx("All", "Tất cả")) ?? categories[1] ?? categories[0],
    level: tx("Beginner", "Cơ bản"),
    price: 0,
    originalPrice: 0,
    duration: "",
    lessons: 0,
    learningOutcomes: [""],
    requirements: [""],
    curriculum: [],
    status: "draft",
    thumbnail: "",
    previewVideoUrl: "",
  });
  const [currentSection, setCurrentSection] = useState<Partial<CurriculumSection> | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Partial<CurriculumLesson> | null>(null);

  const visibleCategories = useMemo(() => categories.filter((item) => item !== tx("All", "Tất cả")), [categories, tx]);

  useEffect(() => {
    if (formData.category && !categories.includes(formData.category as string)) {
      setFormData((prev) => ({
        ...prev,
        category: visibleCategories[0] ?? categories[0],
      }));
    }
  }, [categories, formData.category, visibleCategories]);

  useEffect(() => {
    if (formData.level && !levels.includes(formData.level as string)) {
      setFormData((prev) => ({
        ...prev,
        level: levels[0],
      }));
    }
  }, [formData.level, levels]);

  const handleInputChange = <K extends keyof InstructorCourse>(field: K, value: InstructorCourse[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: "learningOutcomes" | "requirements", index: number, value: string) => {
    const items = [...(formData[field] || [""])];
    items[index] = value;
    handleInputChange(field, items);
  };

  const addArrayItem = (field: "learningOutcomes" | "requirements") => {
    handleInputChange(field, [...(formData[field] || []), ""]);
  };

  const removeArrayItem = (field: "learningOutcomes" | "requirements", index: number) => {
    const items = (formData[field] || []).filter((_, itemIndex) => itemIndex !== index);
    handleInputChange(field, items.length > 0 ? items : [""]);
  };

  const handlePreviewVideoUpload = async (file: File) => {
    setPreviewVideoUploading(true);
    try {
      const result = await uploadLocalVideo(null, file);
      handleInputChange("previewVideoUrl", resolveApiAsset(result.videoUrl ?? ""));
      toast.success(tx("Preview video uploaded from your computer.", "Đã tải video xem trước từ máy tính lên."));
    } catch {
      toast.error(tx("Unable to upload preview video. Please try again.", "Không thể tải video xem trước. Vui lòng thử lại."));
    } finally {
      setPreviewVideoUploading(false);
    }
  };

  const addSection = () => {
    if (!currentSection?.title?.trim()) return;

    const nextSection: CurriculumSection = {
      id: createSectionDraft().id,
      title: currentSection.title.trim(),
      duration: currentSection.duration?.trim() || "0 phút",
      lessons: currentSection.lessons || [],
    };

    handleInputChange("curriculum", [...(formData.curriculum || []), nextSection]);
    setCurrentSection(null);
    toast.success(tx("Section added.", "Đã thêm chương."));
  };

  const addLesson = (sectionId: string) => {
    if (!currentLesson?.title?.trim()) return;

    const nextLesson: CurriculumLesson = {
      id: createLessonDraft().id,
      title: currentLesson.title.trim(),
      duration: currentLesson.duration?.trim() || "0 phút",
      type: currentLesson.type || "video",
      free: Boolean(currentLesson.free),
    };

    handleInputChange(
      "curriculum",
      (formData.curriculum || []).map((section) => (section.id === sectionId ? { ...section, lessons: [...section.lessons, nextLesson] } : section))
    );
    setCurrentLesson(null);
    toast.success(tx("Lesson added.", "Đã thêm bài học."));
  };

  const removeSection = (sectionId: string) => {
    handleInputChange("curriculum", (formData.curriculum || []).filter((section) => section.id !== sectionId));
  };

  const removeLesson = (sectionId: string, lessonId: string) => {
    handleInputChange(
      "curriculum",
      (formData.curriculum || []).map((section) =>
        section.id === sectionId ? { ...section, lessons: section.lessons.filter((lesson) => lesson.id !== lessonId) } : section
      )
    );
  };

  const handleSubmit = async (saveAsDraft = true) => {
    setLoading(true);
    try {
      const title = (formData.title || "").trim();
      const description = (formData.description || "").trim();
      const price = Number(formData.price || 0);

      if (!title || !description) {
        toast.error(tx("Please fill in the title and description.", "Vui lòng điền đầy đủ tiêu đề và mô tả."));
        return;
      }

      if (!Number.isFinite(price) || price <= 0) {
        toast.error(tx("Please enter a valid course price.", "Vui lòng nhập giá khóa học hợp lệ."));
        return;
      }

      const cleanedData = {
        ...formData,
        title,
        description,
        price,
        learningOutcomes: (formData.learningOutcomes || []).map((item) => item.trim()).filter(Boolean),
        requirements: (formData.requirements || []).map((item) => item.trim()).filter(Boolean),
        curriculum: formData.curriculum || [],
        status: saveAsDraft ? "draft" : "pending",
      } as Omit<InstructorCourse, "id" | "numericId" | "createdAt" | "students" | "rating" | "revenue">;

      const totalLessons = cleanedData.curriculum.reduce((sum, section) => sum + section.lessons.length, 0);
      cleanedData.lessons = totalLessons;

      const result = await onCreateCourse(cleanedData);
      if (result.success) {
        toast.success(result.message);
        onSuccessNavigate();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error(tx("Something went wrong. Please try again.", "Có lỗi xảy ra. Vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    previewVideoUploading,
    formData,
    currentSection,
    setCurrentSection,
    currentLesson,
    setCurrentLesson,
    visibleCategories,
    handleInputChange,
    handleArrayChange,
    addArrayItem,
    removeArrayItem,
    handlePreviewVideoUpload,
    addSection,
    addLesson,
    removeSection,
    removeLesson,
    handleSubmit,
  } as const;
}
