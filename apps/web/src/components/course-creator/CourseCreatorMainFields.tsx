"use client";

import type { InstructorCourse } from "@/contexts/InstructorContext";
import { CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/app/providers";

type Props = {
  categories: string[];
  visibleCategories: string[];
  formData: Partial<InstructorCourse>;
  onChangeField: <K extends keyof InstructorCourse>(field: K, value: InstructorCourse[K]) => void;
};

export default function CourseCreatorMainFields({ visibleCategories, formData, onChangeField }: Props) {
  const { tx } = useI18n();

  return (
    <CardContent className="space-y-4">
      <div>
        <Label htmlFor="title">{tx("Course title", "Tiêu đề khóa học")} *</Label>
        <Input id="title" placeholder={tx("e.g. Mastering Figma from A-Z", "VD: Mastering Figma từ A-Z")} value={formData.title || ""} onChange={(e) => onChangeField("title", e.target.value)} />
      </div>

      <div>
        <Label htmlFor="description">{tx("Course description", "Mô tả khóa học")} *</Label>
        <Textarea
          id="description"
          placeholder={tx("Describe the course content and benefits in detail...", "Mô tả chi tiết về nội dung và lợi ích của khóa học...")}
          rows={5}
          value={formData.description || ""}
          onChange={(e) => onChangeField("description", e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>{tx("Category", "Danh mục")} *</Label>
          <Select value={formData.category || visibleCategories[0]} onValueChange={(value) => onChangeField("category", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {visibleCategories.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>{tx("Level", "Cấp độ")} *</Label>
          <Select value={formData.level || tx("Beginner", "Cơ bản")} onValueChange={(value) => onChangeField("level", value as InstructorCourse["level"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={tx("Beginner", "Cơ bản")}>{tx("Beginner", "Cơ bản")}</SelectItem>
              <SelectItem value={tx("Intermediate", "Trung cấp")}>{tx("Intermediate", "Trung cấp")}</SelectItem>
              <SelectItem value={tx("Advanced", "Nâng cao")}>{tx("Advanced", "Nâng cao")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardContent>
  );
}
