"use client";

import { useMemo } from "react";
import { useNavigate } from "@/lib/router";
import { useI18n } from "@/app/providers";
import { useAuth } from "@/contexts/AuthContext";
import { useInstructor } from "@/contexts/InstructorContext";
import { getCourseCategories } from "@/data/courses";
import CourseCreatorBasicInfo from "@/components/course-creator/CourseCreatorBasicInfo";
import CourseCreatorArraySection from "@/components/course-creator/CourseCreatorArraySection";
import CourseCreatorCurriculum from "@/components/course-creator/CourseCreatorCurriculum";
import CourseCreatorActions from "@/components/course-creator/CourseCreatorActions";
import { useCourseCreatorForm } from "@/components/course-creator/useCourseCreatorForm";

export default function CourseCreator() {
  const navigate = useNavigate();
  const { isInstructor } = useAuth();
  const { createCourse } = useInstructor();
  const { locale, tx } = useI18n();
  const categories = useMemo(() => getCourseCategories(locale), [locale]);

  const {
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
  } = useCourseCreatorForm({
    onCreateCourse: createCourse,
    onSuccessNavigate: () => navigate("/instructor"),
  });

  if (!isInstructor) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-5xl px-4">
        <div className="space-y-6">
          <CourseCreatorBasicInfo
            categories={categories}
            visibleCategories={visibleCategories}
            formData={formData}
            onChangeField={handleInputChange}
            previewVideoUploading={previewVideoUploading}
            onPreviewVideoUpload={handlePreviewVideoUpload}
          />

          <CourseCreatorArraySection
            title={tx("Learning outcomes", "Mục tiêu học tập")}
            description={tx("What will learners gain from this course?", "Học viên sẽ học được gì từ khóa học này?")}
            items={formData.learningOutcomes || [""]}
            placeholderPrefix={tx("Outcome", "Mục tiêu")}
            onAdd={() => addArrayItem("learningOutcomes")}
            onRemove={(index) => removeArrayItem("learningOutcomes", index)}
            onChange={(index, value) => handleArrayChange("learningOutcomes", index, value)}
          />

          <CourseCreatorArraySection
            title={tx("Requirements", "Yêu cầu")}
            description={tx("What should learners know before joining?", "Học viên cần có gì trước khi tham gia?")}
            items={formData.requirements || [""]}
            placeholderPrefix={tx("Requirement", "Yêu cầu")}
            onAdd={() => addArrayItem("requirements")}
            onRemove={(index) => removeArrayItem("requirements", index)}
            onChange={(index, value) => handleArrayChange("requirements", index, value)}
          />

          <CourseCreatorCurriculum
            sections={formData.curriculum || []}
            currentSection={currentSection}
            setCurrentSection={setCurrentSection}
            currentLesson={currentLesson}
            setCurrentLesson={setCurrentLesson}
            onAddSection={addSection}
            onRemoveSection={removeSection}
            onAddLesson={addLesson}
            onRemoveLesson={removeLesson}
          />

          <CourseCreatorActions
            loading={loading}
            onCancel={() => navigate("/instructor")}
            onSaveDraft={() => handleSubmit(true)}
            onSubmitForReview={() => handleSubmit(false)}
          />
        </div>
      </div>
    </div>
  );
}
