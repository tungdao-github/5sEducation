"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, Copy, Calendar } from "lucide-react";
import { toast } from "@/figma/compat/sonner";
import {
  fetchAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  deleteAdminCoupon,
  type CouponDto,
} from "../../data/api";

type CouponForm = {
  code: string;
  description: string;
  type: "fixed" | "percent";
  value: string;
  minOrder: string;
  maxUses: string;
  expiresAt: string;
  isActive: boolean;
};

const defaultForm: CouponForm = {
  code: "",
  description: "",
  type: "fixed",
  value: "",
  minOrder: "",
  maxUses: "",
  expiresAt: "",
  isActive: true,
};

function isExpired(expiresAt?: string | null) {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}

export default function CouponsTab() {
  const [coupons, setCoupons] = useState<CouponDto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CouponForm>(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetchAdminCoupons()
      .then((data) => {
        if (!active) return;
        setCoupons(data);
      })
      .catch(() => {
        if (!active) return;
        setCoupons([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const active = coupons.filter((c) => c.isActive && !isExpired(c.expiresAt)).length;
    const used = coupons.reduce((s, c) => s + c.usedCount, 0);
    const expired = coupons.filter((c) => isExpired(c.expiresAt)).length;
    return { active, used, expired };
  }, [coupons]);

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!form.code.trim()) {
      toast.error("Mã coupon không được để trống");
      return;
    }
    setSaving(true);
    const payload = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || undefined,
      type: form.type,
      value: Number(form.value) || 0,
      minOrder: Number(form.minOrder) || 0,
      maxUses: Number(form.maxUses) || 0,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      isActive: form.isActive,
    };

    try {
      if (editingId) {
        await updateAdminCoupon(editingId, payload);
        const refreshed = await fetchAdminCoupons();
        setCoupons(refreshed);
        toast.success("Đã cập nhật coupon!");
      } else {
        const created = await createAdminCoupon(payload);
        setCoupons((prev) => [created, ...prev]);
        toast.success("Đã thêm coupon mới!");
      }
      resetForm();
    } catch {
      toast.error("Lưu coupon thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (coupon: CouponDto) => {
    setForm({
      code: coupon.code,
      description: coupon.description || "",
      type: (coupon.type as "fixed" | "percent") || "fixed",
      value: coupon.value ? String(coupon.value) : "",
      minOrder: coupon.minOrder ? String(coupon.minOrder) : "",
      maxUses: coupon.maxUses ? String(coupon.maxUses) : "",
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : "",
      isActive: coupon.isActive,
    });
    setEditingId(coupon.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAdminCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success("Đã xóa coupon!");
    } catch {
      toast.error("Không thể xóa coupon.");
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => toast.success("Đã copy mã!"));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="grid grid-cols-3 gap-3 flex-1">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-700">{stats.active}</p>
            <p className="text-xs text-gray-500">Đang hoạt động</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{stats.used}</p>
            <p className="text-xs text-gray-500">Lượt sử dụng</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-orange-700">{stats.expired}</p>
            <p className="text-xs text-gray-500">Hết hạn</p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm(defaultForm);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition text-sm font-medium whitespace-nowrap ml-4"
        >
          <Plus className="size-4" /> Thêm coupon
        </button>
      </div>

      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{editingId ? "Sửa coupon" : "Thêm coupon mới"}</h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">×</button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã coupon *</label>
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại giảm</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "fixed" | "percent" }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="fixed">Giảm cố định</option>
                <option value="percent">Giảm phần trăm</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị giảm</label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Đơn tối thiểu</label>
              <input
                type="number"
                value={form.minOrder}
                onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giới hạn lượt dùng</label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hạn dùng</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Trạng thái:</label>
              <button
                onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${form.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
              >
                {form.isActive ? "Hoạt động" : "Tắt"}
              </button>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-60"
            >
              <Plus className="size-4" /> {saving ? "Đang lưu..." : editingId ? "Cập nhật" : "Thêm mới"}
            </button>
            <button
              onClick={resetForm}
              className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {coupons.map((coupon) => {
          const expired = isExpired(coupon.expiresAt);
          const usagePercent = coupon.maxUses > 0 ? Math.min((coupon.usedCount / coupon.maxUses) * 100, 100) : 0;
          return (
            <div key={coupon.id} className={`border rounded-xl p-4 ${expired ? "border-gray-200 bg-gray-50 opacity-75" : coupon.isActive ? "border-green-200 bg-white" : "border-gray-200 bg-white"}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <code className="font-bold text-lg text-gray-900">{coupon.code}</code>
                    <button onClick={() => handleCopy(coupon.code)} className="p-1 text-gray-400 hover:text-blue-600 transition">
                      <Copy className="size-4" />
                    </button>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${expired ? "bg-red-100 text-red-600" : coupon.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {expired ? "Hết hạn" : coupon.isActive ? "Hoạt động" : "Tắt"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                    <span>Giảm: <strong className="text-green-600">{coupon.type === "fixed" ? `${coupon.value}` : `${coupon.value}%`}</strong></span>
                    <span>Đơn tối thiểu: <strong>{coupon.minOrder}</strong></span>
                    <span className="flex items-center gap-1"><Calendar className="size-3" />Hạn: {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString("vi-VN") : "--"}</span>
                  </div>
                  <div className="mt-2">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${usagePercent}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block">Đã sử dụng: {coupon.usedCount}/{coupon.maxUses || "∞"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit(coupon)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition">
                    <Edit className="size-4" />
                  </button>
                  <button onClick={() => handleDelete(coupon.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {coupons.length === 0 && <div className="text-sm text-gray-500">Chưa có mã giảm giá.</div>}
      </div>
    </div>
  );
}
