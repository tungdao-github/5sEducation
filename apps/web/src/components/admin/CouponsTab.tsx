"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useI18n } from "@/app/providers";
import { toast } from "@/lib/notify";
import { createAdminCoupon, deleteAdminCoupon, fetchAdminCoupons, updateAdminCoupon, type CouponDto } from "@/services/api";
import CouponFormPanel, { type CouponForm } from "@/components/admin/CouponFormPanel";
import CouponList from "@/components/admin/CouponList";
import CouponStatsCards from "@/components/admin/CouponStatsCards";

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
  const { tx } = useI18n();
  const [coupons, setCoupons] = useState<CouponDto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CouponForm>(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetchAdminCoupons()
      .then((data) => {
        if (active) setCoupons(data);
      })
      .catch(() => {
        if (active) setCoupons([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const active = coupons.filter((coupon) => coupon.isActive && !isExpired(coupon.expiresAt)).length;
    const used = coupons.reduce((sum, coupon) => sum + coupon.usedCount, 0);
    const expired = coupons.filter((coupon) => isExpired(coupon.expiresAt)).length;
    return { active, used, expired };
  }, [coupons]);

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!form.code.trim()) {
      toast.error(tx("Coupon code cannot be empty.", "Mã coupon không được để trống"));
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
        setCoupons(await fetchAdminCoupons());
        toast.success(tx("Coupon updated!", "Đã cập nhật coupon!"));
      } else {
        const created = await createAdminCoupon(payload);
        setCoupons((prev) => [created, ...prev]);
        toast.success(tx("Coupon created!", "Đã thêm coupon mới!"));
      }
      resetForm();
    } catch {
      toast.error(tx("Unable to save coupon.", "Lưu coupon thất bại."));
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
      setCoupons((prev) => prev.filter((coupon) => coupon.id !== id));
      toast.success(tx("Coupon deleted!", "Đã xóa coupon!"));
    } catch {
      toast.error(tx("Unable to delete coupon.", "Không thể xóa coupon."));
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => toast.success(tx("Coupon code copied!", "Đã copy mã!")));
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <CouponStatsCards active={stats.active} used={stats.used} expired={stats.expired} />
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm(defaultForm);
          }}
          className="ml-4 flex items-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus className="size-4" /> {tx("Add coupon", "Thêm coupon")}
        </button>
      </div>

      <CouponFormPanel
        open={showForm}
        editingId={editingId}
        form={form}
        saving={saving}
        onClose={resetForm}
        onChange={setForm}
        onSubmit={handleSubmit}
      />

      <CouponList coupons={coupons} onEdit={handleEdit} onDelete={handleDelete} onCopy={handleCopy} />
    </div>
  );
}
