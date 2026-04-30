import type { ReactNode } from "react";
import { CheckCircle, Clock, FileText, XCircle } from "lucide-react";

export const statusMeta: Record<string, { label: string; className: string; icon: ReactNode }> = {
  published: { label: "Đã xuất bản", className: "bg-emerald-100 text-emerald-700", icon: <CheckCircle className="size-3" /> },
  pending: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700", icon: <Clock className="size-3" /> },
  draft: { label: "Nháp", className: "bg-slate-100 text-slate-700", icon: <FileText className="size-3" /> },
  rejected: { label: "Từ chối", className: "bg-rose-100 text-rose-700", icon: <XCircle className="size-3" /> },
};

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}
