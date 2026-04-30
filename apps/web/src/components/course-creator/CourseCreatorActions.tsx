"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/app/providers";

type Props = {
  loading: boolean;
  onCancel: () => void;
  onSaveDraft: () => void;
  onSubmitForReview: () => void;
};

export default function CourseCreatorActions({ loading, onCancel, onSaveDraft, onSubmitForReview }: Props) {
  const { tx } = useI18n();

  return (
    <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white p-4">
      <Button variant="outline" onClick={onCancel} disabled={loading}>
        {tx("Cancel", "Hủy")}
      </Button>
      <Button variant="outline" onClick={onSaveDraft} disabled={loading}>
        {tx("Save draft", "Lưu nháp")}
      </Button>
      <Button onClick={onSubmitForReview} disabled={loading}>
        {loading ? tx("Processing...", "Đang xử lý...") : tx("Submit for review", "Gửi để phê duyệt")}
      </Button>
    </div>
  );
}
