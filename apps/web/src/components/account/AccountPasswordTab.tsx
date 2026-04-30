"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useI18n } from "@/app/providers";
import { fetchJsonWithAuth } from "@/lib/api";
import { toast } from "@/lib/notify";
import AccountTwoFactorSettings from "@/components/account/AccountTwoFactorSettings";

export default function AccountPasswordTab() {
  const { tx } = useI18n();
  const [passwords, setPasswords] = useState({ current: "", newPwd: "", confirm: "" });

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (passwords.newPwd !== passwords.confirm) {
      toast.error(tx("New password does not match.", "Mật khẩu mới không khớp"));
      return;
    }
    if (passwords.newPwd.length < 6) {
      toast.error(tx("Password must be at least 6 characters.", "Mật khẩu phải ít nhất 6 ký tự"));
      return;
    }
    try {
      await fetchJsonWithAuth("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPwd }),
      });
      toast.success(tx("Password updated successfully!", "Đổi mật khẩu thành công!"));
      setPasswords({ current: "", newPwd: "", confirm: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tx("Unable to change password.", "Không thể đổi mật khẩu"));
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="mb-5 text-lg font-semibold text-gray-900">{tx("Change password", "Đổi mật khẩu")}</h2>
      <form onSubmit={handleChangePassword} className="max-w-sm space-y-4">
        {[
          { id: "current", label: tx("Current password", "Mật khẩu hiện tại"), key: "current" },
          { id: "newPwd", label: tx("New password", "Mật khẩu mới"), key: "newPwd" },
          { id: "confirm", label: tx("Confirm new password", "Xác nhận mật khẩu mới"), key: "confirm" },
        ].map((field) => (
          <div key={field.id}>
            <label className="mb-1 block text-sm font-medium text-gray-700">{field.label}</label>
            <input
              type="password"
              value={passwords[field.key as keyof typeof passwords]}
              onChange={(e) => setPasswords((p) => ({ ...p, [field.key]: e.target.value }))}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
        ))}
        <button
          type="submit"
          className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          {tx("Update password", "Cập nhật mật khẩu")}
        </button>
        <p className="text-xs text-gray-400">{tx("Password must be at least 6 characters.", "Mật khẩu phải có ít nhất 6 ký tự")}</p>
      </form>
      <div className="border-t border-gray-200 pt-8">
        <AccountTwoFactorSettings />
      </div>
    </div>
  );
}
