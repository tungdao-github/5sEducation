"use client";

import type { InstructorCourse } from "@/contexts/InstructorContext";
import { CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/app/providers";

type Props = {
  formData: Partial<InstructorCourse>;
  onChangeField: <K extends keyof InstructorCourse>(field: K, value: InstructorCourse[K]) => void;
};

export default function CourseCreatorPricingFields({ formData, onChangeField }: Props) {
  const { tx } = useI18n();

  return (
    <CardContent className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="price">{tx("Price (VND)", "Giá bán (VND)")} *</Label>
          <Input id="price" type="number" placeholder="299000" value={formData.price || 0} onChange={(e) => onChangeField("price", Number(e.target.value) || 0)} />
        </div>
        <div>
          <Label htmlFor="originalPrice">{tx("Original price (VND)", "Giá gốc (VND)")}</Label>
          <Input id="originalPrice" type="number" placeholder="399000" value={formData.originalPrice || 0} onChange={(e) => onChangeField("originalPrice", Number(e.target.value) || 0)} />
        </div>
        <div>
          <Label htmlFor="duration">{tx("Duration", "Thời lượng")}</Label>
          <Input id="duration" placeholder={tx("e.g. 8 hours", "VD: 8 giờ")} value={formData.duration || ""} onChange={(e) => onChangeField("duration", e.target.value)} />
        </div>
      </div>
    </CardContent>
  );
}
