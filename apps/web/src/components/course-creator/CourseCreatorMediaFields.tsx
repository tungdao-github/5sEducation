"use client";

import type { InstructorCourse } from "@/contexts/InstructorContext";
import { CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useI18n } from "@/app/providers";

type Props = {
  formData: Partial<InstructorCourse>;
  previewVideoUploading: boolean;
  onChangeField: <K extends keyof InstructorCourse>(field: K, value: InstructorCourse[K]) => void;
  onPreviewVideoUpload: (file: File) => void;
};

export default function CourseCreatorMediaFields({ formData, previewVideoUploading, onChangeField, onPreviewVideoUpload }: Props) {
  const { tx } = useI18n();

  return (
    <CardContent className="space-y-4">
      <div>
        <Label htmlFor="thumbnail">{tx("Thumbnail URL", "URL thumbnail")}</Label>
        <div className="flex gap-2">
          <Input id="thumbnail" placeholder="https://..." value={formData.thumbnail || ""} onChange={(e) => onChangeField("thumbnail", e.target.value)} />
          <Button variant="outline" type="button">
            <Upload className="size-4" />
          </Button>
        </div>
        {formData.thumbnail ? <img src={formData.thumbnail} alt={tx("Thumbnail preview", "Xem trước thumbnail")} className="mt-2 h-40 w-full rounded object-cover" /> : null}
      </div>

      <div>
        <Label htmlFor="previewVideoUrl">{tx("Preview video", "Video xem trước")}</Label>
        <div className="flex gap-2">
          <Input id="previewVideoUrl" placeholder="https://..." value={formData.previewVideoUrl || ""} onChange={(e) => onChangeField("previewVideoUrl", e.target.value)} />
          <Button variant="outline" type="button" disabled={previewVideoUploading} onClick={() => document.getElementById("previewVideoFile")?.click()}>
            <Upload className="size-4" />
          </Button>
        </div>
        <input
          id="previewVideoFile"
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onPreviewVideoUpload(file);
            }
            e.currentTarget.value = "";
          }}
        />
        <p className="mt-2 text-sm text-gray-500">
          {tx("The video is stored locally in the uploads/videos folder.", "Video được lưu cục bộ trong thư mục uploads/videos.")}
        </p>
        {formData.previewVideoUrl ? <video src={formData.previewVideoUrl} controls className="mt-3 w-full rounded-lg border border-gray-200" /> : null}
      </div>
    </CardContent>
  );
}
