"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import { notify } from "@/lib/notify";
import { useI18n } from "@/app/providers";

type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  isAdmin: boolean;
};

export default function AccountPage() {
  const { tx } = useI18n();
  const [needsAuth, setNeedsAuth] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const loadProfile = async (token: string) => {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401 || res.status === 403) {
      setNeedsAuth(true);
      return;
    }

    if (res.ok) {
      const data = (await res.json()) as UserProfile;
      setProfile(data);
      setFirstName(data.firstName ?? "");
      setLastName(data.lastName ?? "");
      setAvatarUrl(data.avatarUrl ?? "");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }
    loadProfile(token);
  }, []);

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          avatarUrl,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || tx("Profile update failed.", "Cap nhat ho so that bai."));
      }

      const data = (await res.json()) as UserProfile;
      setProfile(data);
      notify({
        title: tx("Profile saved", "Da luu ho so"),
        message: tx("Your changes were saved.", "Da cap nhat thong tin tai khoan."),
      });
      window.dispatchEvent(new Event("auth-changed"));
    } catch (error) {
      notify({
        title: tx("Save failed", "Luu that bai"),
        message: error instanceof Error ? error.message : tx("Please try again.", "Vui long thu lai."),
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    if (!currentPassword.trim() || !newPassword.trim()) {
      notify({
        title: tx("Missing fields", "Thieu thong tin"),
        message: tx("Enter both current and new password.", "Nhap ca mat khau hien tai va mat khau moi."),
      });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || tx("Password update failed.", "Doi mat khau that bai."));
      }

      setCurrentPassword("");
      setNewPassword("");
      notify({
        title: tx("Password updated", "Da doi mat khau"),
        message: tx("Use your new password next time.", "Lan sau hay dang nhap bang mat khau moi."),
      });
    } catch (error) {
      notify({
        title: tx("Update failed", "Cap nhat that bai"),
        message: error instanceof Error ? error.message : tx("Please try again.", "Vui long thu lai."),
      });
    } finally {
      setSavingPassword(false);
    }
  };

  if (needsAuth) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-16 fade-in">
        <div className="glass-card rounded-3xl p-10 text-center">
          <p className="text-sm text-emerald-800/70">
            {tx("Please sign in to manage your account.", "Vui long dang nhap de quan ly tai khoan.")}
          </p>
          <Link
            href="/login?next=/account"
            className="mt-4 inline-flex rounded-full bg-emerald-700 px-6 py-2 text-sm font-semibold text-white"
          >
            {tx("Sign in", "Dang nhap")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-6 py-12 fade-in">
      <div className="space-y-2">
        <Link href="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {tx("Home", "Trang chu")}
        </Link>
        <h1 className="section-title text-4xl font-semibold text-emerald-950">
          {tx("Account settings", "Cai dat tai khoan")}
        </h1>
        <p className="text-sm text-emerald-800/70">
          {tx("Update your profile and password.", "Cap nhat ho so va mat khau cua ban.")}
        </p>
      </div>

      <section className="glass-card space-y-6 rounded-3xl p-8">
        <div>
          <h2 className="section-title text-2xl font-semibold text-emerald-950">
            {tx("Profile", "Ho so")}
          </h2>
          {profile?.email && (
            <p className="text-xs text-emerald-800/70">
              {tx("Signed in as", "Dang dang nhap")}: {profile.email}
            </p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("First name", "Ten")}
            </label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.currentTarget.value)}
              className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("Last name", "Ho")}
            </label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.currentTarget.value)}
              className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            {tx("Avatar URL", "Link avatar")}
          </label>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.currentTarget.value)}
            className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
          />
        </div>

        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={savingProfile}
          className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white"
        >
          {savingProfile ? tx("Saving...", "Dang luu...") : tx("Save profile", "Luu ho so")}
        </button>
      </section>

      <section className="glass-card space-y-6 rounded-3xl p-8">
        <div>
          <h2 className="section-title text-2xl font-semibold text-emerald-950">
            {tx("Change password", "Doi mat khau")}
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("Current password", "Mat khau hien tai")}
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.currentTarget.value)}
              className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("New password", "Mat khau moi")}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.currentTarget.value)}
              className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleChangePassword}
          disabled={savingPassword}
          className="rounded-full border border-emerald-200 px-6 py-3 text-sm font-semibold text-emerald-900"
        >
          {savingPassword ? tx("Updating...", "Dang doi...") : tx("Update password", "Cap nhat mat khau")}
        </button>
      </section>
    </div>
  );
}
