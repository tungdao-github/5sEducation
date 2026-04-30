"use client";

import type { InstructorCourse } from "@/contexts/InstructorContext";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CourseCreatorMainFields from "@/components/course-creator/CourseCreatorMainFields";
import CourseCreatorPricingFields from "@/components/course-creator/CourseCreatorPricingFields";
import CourseCreatorMediaFields from "@/components/course-creator/CourseCreatorMediaFields";
import { useI18n } from "@/app/providers";

type Props = {
  categories: string[];
  visibleCategories: string[];
  formData: Partial<InstructorCourse>;
  onChangeField: <K extends keyof InstructorCourse>(field: K, value: InstructorCourse[K]) => void;
  previewVideoUploading: boolean;
  onPreviewVideoUpload: (file: File) => void;
};

export default function CourseCreatorBasicInfo({
  categories,
  visibleCategories,
  formData,
  onChangeField,
  previewVideoUploading,
  onPreviewVideoUpload,
}: Props) {
  const { tx } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tx("Basic information", "Thông tin cơ bản")}</CardTitle>
        <CardDescription>{tx("Main course information", "Thông tin chính về khóa học")}</CardDescription>
      </CardHeader>
      <CourseCreatorMainFields categories={categories} visibleCategories={visibleCategories} formData={formData} onChangeField={onChangeField} />
      <CourseCreatorPricingFields formData={formData} onChangeField={onChangeField} />
      <CourseCreatorMediaFields
        formData={formData}
        previewVideoUploading={previewVideoUploading}
        onChangeField={onChangeField}
        onPreviewVideoUpload={onPreviewVideoUpload}
      />
    </Card>
  );
}
