"use client";

import { useEffect, useState } from "react";
import { Edit3, Save, X } from "lucide-react";
import { useI18n } from "@/app/providers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/lib/notify";

export default function AccountProfileTab() {
  const { tx, locale } = useI18n();
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
  });

  useEffect(() => {
    if (!user) return;
    setEditForm({ name: user.name || "", phone: user.phone || "", bio: user.bio || "" });
  }, [user]);

  if (!user) return null;

  const handleSaveProfile = () => {
    if (!editForm.name.trim()) {
      toast.error(tx("Name cannot be empty.", "Tên không được để trống."));
      return;
    }
    updateUser({ name: editForm.name, phone: editForm.phone, bio: editForm.bio });
    setIsEditing(false);
    toast.success(tx("Profile updated successfully!", "Hồ sơ đã được cập nhật!"));
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{tx("Profile", "Hồ sơ cá nhân")}</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-1.5 text-sm text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
          >
            <Edit3 className="size-4" />
            {tx("Edit", "Chỉnh sửa")}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              <X className="size-4" />
              {tx("Cancel", "Hủy")}
            </button>
            <button
              onClick={handleSaveProfile}
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
            >
              <Save className="size-4" />
              {tx("Save", "Lưu")}
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">{tx("Full name", "Họ và tên")}</label>
          {isEditing ? (
            <input
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">{tx("Email", "Email")}</label>
          <p className="text-sm text-gray-900">{user.email}</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">{tx("Phone number", "Số điện thoại")}</label>
          {isEditing ? (
            <input
              value={editForm.phone}
              onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-sm text-gray-900">{user.phone || "—"}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">{tx("Member since", "Thành viên từ")}</label>
          <p className="text-sm text-gray-900">{new Date(user.joinDate).toLocaleDateString(locale === "vi" ? "vi-VN" : locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : "en-US")}</p>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-500">{tx("Bio", "Giới thiệu")}</label>
          {isEditing ? (
            <textarea
              value={editForm.bio}
              onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-sm text-gray-700">{user.bio || "—"}</p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-900">{tx("Your reward points", "Điểm thưởng của bạn")}</p>
            <p className="mt-0.5 text-xs text-blue-600">{tx("Collect points to unlock special offers.", "Tích điểm để nhận ưu đãi đặc biệt")}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">{user.points.toLocaleString()}</p>
            <p className="text-xs text-blue-500">{tx("points", "điểm")}</p>
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-blue-100">
          <div
            className="h-2 rounded-full bg-blue-500 transition-all"
            style={{ width: `${Math.min((user.points / 2000) * 100, 100)}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-blue-500">{Math.max(0, 2000 - user.points)} {tx("more points to reach Gold", "điểm nữa để đạt Gold")}</p>
      </div>
    </div>
  );
}
