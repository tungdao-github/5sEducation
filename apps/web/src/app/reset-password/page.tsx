"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { API_URL } from "@/lib/api";
import { useI18n } from "@/app/providers";

export default function ResetPasswordPage() {
  const { tx } = useI18n();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !token) {
      setMessage(tx("Missing reset token.", "Thieu token dat lai."));
      return;
    }

    if (newPassword.trim().length < 6) {
      setMessage(tx("Password is too short.", "Mat khau qua ngan."));
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage(tx("Passwords do not match.", "Mat khau khong khop."));
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          newPassword,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || tx("Reset failed.", "Dat lai that bai."));
      }

      setMessage(tx("Password updated. You can log in now.", "Da doi mat khau. Co the dang nhap lai."));
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : tx("Reset failed.", "Dat lai that bai."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-shell py-16 fade-in">
      <div className="surface-card mx-auto max-w-md p-8">
        <h1 className="section-title text-3xl font-semibold text-emerald-950">
          {tx("Set a new password", "Tao mat khau moi")}
        </h1>
        <p className="mt-2 text-sm text-emerald-800/70">
          {tx("Create a new password for your account.", "Nhap mat khau moi cho tai khoan.")}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("New password", "Mat khau moi")}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.currentTarget.value)}
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm text-emerald-950"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("Confirm password", "Xac nhan mat khau")}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.currentTarget.value)}
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm text-emerald-950"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white"
          >
            {loading ? tx("Updating...", "Dang doi...") : tx("Update password", "Cap nhat mat khau")}
          </button>
        </form>

        {message && (
          <div className="mt-4 surface-muted px-4 py-3 text-sm text-emerald-800">
            {message}
          </div>
        )}

        <p className="mt-6 text-center text-sm text-emerald-800/70">
          <Link href="/login" className="font-semibold text-emerald-900">
            {tx("Back to login", "Quay lai dang nhap")}
          </Link>
        </p>
      </div>
    </div>
  );
}

