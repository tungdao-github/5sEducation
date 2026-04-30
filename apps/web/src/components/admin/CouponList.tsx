"use client";

import { Calendar, Copy, Edit, Trash2 } from "lucide-react";
import { useI18n } from "@/app/providers";
import type { CouponDto } from "@/services/api";
import { toIntlLocale } from "@/components/admin/adminLocale";

type Props = {
  coupons: CouponDto[];
  onEdit: (coupon: CouponDto) => void;
  onDelete: (id: number) => void;
  onCopy: (code: string) => void;
};

export default function CouponList({ coupons, onEdit, onDelete, onCopy }: Props) {
  const { tx, locale } = useI18n();

  return (
    <div className="space-y-3">
      {coupons.map((coupon) => (
        <div key={coupon.id} className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded bg-blue-50 px-3 py-1.5 font-mono text-sm font-bold text-blue-700">{coupon.code}</span>
                <button onClick={() => onCopy(coupon.code)} className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-blue-600">
                  <Copy className="size-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600">{coupon.description || tx("No description", "Không có mô tả")}</p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                <span className="rounded-full bg-gray-100 px-2.5 py-1">
                  {tx("Type", "Loại")}: {coupon.type === "fixed" ? tx("Fixed amount", "Giảm cố định") : tx("Percent off", "Giảm phần trăm")}
                </span>
                <span className="rounded-full bg-gray-100 px-2.5 py-1">
                  {tx("Value", "Giá trị")}: {coupon.value}
                </span>
                <span className="rounded-full bg-gray-100 px-2.5 py-1">
                  {tx("Used", "Đã dùng")}: {coupon.usedCount}
                </span>
                {coupon.expiresAt ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1">
                    <Calendar className="size-3.5" /> {new Date(coupon.expiresAt).toLocaleDateString(toIntlLocale(locale))}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onEdit(coupon)} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-2 text-sm text-blue-600 transition hover:bg-blue-50">
                <Edit className="size-4" />
                {tx("Edit", "Sửa")}
              </button>
              <button onClick={() => onDelete(coupon.id)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50">
                <Trash2 className="size-4" />
                {tx("Delete", "Xóa")}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
