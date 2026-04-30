"use client";

import { Plus } from "lucide-react";
import { useI18n } from "@/app/providers";

export type CouponForm = {
  code: string;
  description: string;
  type: "fixed" | "percent";
  value: string;
  minOrder: string;
  maxUses: string;
  expiresAt: string;
  isActive: boolean;
};

type Props = {
  open: boolean;
  editingId: number | null;
  form: CouponForm;
  saving: boolean;
  onClose: () => void;
  onChange: (updater: (current: CouponForm) => CouponForm) => void;
  onSubmit: () => void;
};

export default function CouponFormPanel({ open, editingId, form, saving, onClose, onChange, onSubmit }: Props) {
  const { tx } = useI18n();
  if (!open) return null;

  return (
    <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{editingId ? tx("Edit coupon", "Sửa coupon") : tx("Add new coupon", "Thêm coupon mới")}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Coupon code *", "Mã coupon *")}</label>
          <input value={form.code} onChange={(e) => onChange((current) => ({ ...current, code: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Discount type", "Loại giảm")}</label>
          <select value={form.type} onChange={(e) => onChange((current) => ({ ...current, type: e.target.value as "fixed" | "percent" }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="fixed">{tx("Fixed amount", "Giảm cố định")}</option>
            <option value="percent">{tx("Percent off", "Giảm phần trăm")}</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Discount value", "Giá trị giảm")}</label>
          <input type="number" value={form.value} onChange={(e) => onChange((current) => ({ ...current, value: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Minimum order", "Đơn tối thiểu")}</label>
          <input type="number" value={form.minOrder} onChange={(e) => onChange((current) => ({ ...current, minOrder: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Usage limit", "Giới hạn lượt dùng")}</label>
          <input type="number" value={form.maxUses} onChange={(e) => onChange((current) => ({ ...current, maxUses: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Expires at", "Hạn dùng")}</label>
          <input type="date" value={form.expiresAt} onChange={(e) => onChange((current) => ({ ...current, expiresAt: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Description", "Mô tả")}</label>
          <input value={form.description} onChange={(e) => onChange((current) => ({ ...current, description: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">{tx("Status:", "Trạng thái:")}</label>
          <button onClick={() => onChange((current) => ({ ...current, isActive: !current.isActive }))} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${form.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
            {form.isActive ? tx("Active", "Hoạt động") : tx("Disabled", "Tắt")}
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button onClick={onSubmit} disabled={saving} className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60">
          <Plus className="size-4" /> {saving ? tx("Saving...", "Đang lưu...") : editingId ? tx("Update", "Cập nhật") : tx("Add new", "Thêm mới")}
        </button>
        <button onClick={onClose} className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50">
          {tx("Cancel", "Hủy")}
        </button>
      </div>
    </div>
  );
}
