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
  loyaltyPoints?: number;
  loyaltyTier?: string;
};

type UserAddress = {
  id: number;
  label: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
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
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [addressForm, setAddressForm] = useState({
    label: "",
    recipientName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Vietnam",
    isDefault: false,
  });
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);

  const loyaltyPoints = profile?.loyaltyPoints ?? 0;
  const loyaltyTier = profile?.loyaltyTier ?? "Bronze";

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

  const loadAddresses = async (token: string) => {
    const res = await fetch(`${API_URL}/api/addresses`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401 || res.status === 403) {
      setNeedsAuth(true);
      return;
    }

    if (res.ok) {
      setAddresses(await res.json());
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }
    loadProfile(token);
    loadAddresses(token);
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

  const resetAddressForm = () => {
    setAddressForm({
      label: "",
      recipientName: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Vietnam",
      isDefault: false,
    });
    setEditingAddressId(null);
  };

  const handleSaveAddress = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    if (!addressForm.recipientName.trim() || !addressForm.phone.trim() || !addressForm.line1.trim()) {
      notify({
        title: tx("Missing fields", "Thieu thong tin"),
        message: tx("Recipient, phone, and address are required.", "Can ten nguoi nhan, so dien thoai va dia chi."),
      });
      return;
    }

    if (!addressForm.city.trim() || !addressForm.country.trim()) {
      notify({
        title: tx("Missing fields", "Thieu thong tin"),
        message: tx("City and country are required.", "Can thanh pho va quoc gia."),
      });
      return;
    }

    setSavingAddress(true);
    try {
      const payload = {
        ...addressForm,
        label: addressForm.label.trim(),
        recipientName: addressForm.recipientName.trim(),
        phone: addressForm.phone.trim(),
        line1: addressForm.line1.trim(),
        line2: addressForm.line2?.trim() || "",
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        postalCode: addressForm.postalCode.trim(),
        country: addressForm.country.trim(),
      };

      const res = await fetch(`${API_URL}/api/addresses${editingAddressId ? `/${editingAddressId}` : ""}`, {
        method: editingAddressId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || tx("Address update failed.", "Cap nhat dia chi that bai."));
      }

      notify({
        title: editingAddressId ? tx("Address updated", "Da cap nhat dia chi") : tx("Address added", "Da them dia chi"),
        message: tx("Saved successfully.", "Da luu thanh cong."),
      });
      resetAddressForm();
      loadAddresses(token);
    } catch (error) {
      notify({
        title: tx("Save failed", "Luu that bai"),
        message: error instanceof Error ? error.message : tx("Please try again.", "Vui long thu lai."),
      });
    } finally {
      setSavingAddress(false);
    }
  };

  const handleEditAddress = (address: UserAddress) => {
    setEditingAddressId(address.id);
    setAddressForm({
      label: address.label ?? "",
      recipientName: address.recipientName ?? "",
      phone: address.phone ?? "",
      line1: address.line1 ?? "",
      line2: address.line2 ?? "",
      city: address.city ?? "",
      state: address.state ?? "",
      postalCode: address.postalCode ?? "",
      country: address.country ?? "Vietnam",
      isDefault: address.isDefault ?? false,
    });
  };

  const handleDeleteAddress = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    const res = await fetch(`${API_URL}/api/addresses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
      notify({
        title: tx("Address removed", "Da xoa dia chi"),
        message: tx("Address deleted.", "Da xoa dia chi."),
      });
    }
  };

  const handleSetDefault = async (address: UserAddress) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    const res = await fetch(`${API_URL}/api/addresses/${address.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        label: address.label ?? "",
        recipientName: address.recipientName ?? "",
        phone: address.phone ?? "",
        line1: address.line1 ?? "",
        line2: address.line2 ?? "",
        city: address.city ?? "",
        state: address.state ?? "",
        postalCode: address.postalCode ?? "",
        country: address.country ?? "Vietnam",
        isDefault: true,
      }),
    });

    if (res.ok) {
      loadAddresses(token);
    }
  };

  if (needsAuth) {
    return (
      <div className="section-shell py-16 fade-in">
        <div className="surface-card p-10 text-center">
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
    <div className="section-shell space-y-10 py-12 fade-in">
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
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-900">
          <span className="rounded-full border border-[color:var(--stroke)] px-3 py-1">
            {tx("Tier", "Hang")}: {loyaltyTier}
          </span>
          <span className="rounded-full bg-[color:var(--brand-soft)] px-3 py-1">
            {loyaltyPoints} {tx("points", "diem")}
          </span>
        </div>
      </div>

      <section className="surface-card space-y-6 p-8">
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
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("Last name", "Ho")}
            </label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.currentTarget.value)}
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
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
            className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
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

      <section className="surface-card space-y-6 p-8">
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
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
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
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleChangePassword}
          disabled={savingPassword}
          className="rounded-full border border-[color:var(--stroke)] px-6 py-3 text-sm font-semibold text-emerald-900"
        >
          {savingPassword ? tx("Updating...", "Dang doi...") : tx("Update password", "Cap nhat mat khau")}
        </button>
      </section>

      <section className="surface-card space-y-6 p-8">
        <div>
          <h2 className="section-title text-2xl font-semibold text-emerald-950">
            {tx("Shipping addresses", "Dia chi giao hang")}
          </h2>
          <p className="text-sm text-emerald-800/70">
            {tx("Manage multiple delivery addresses.", "Quan ly nhieu dia chi giao hang.")}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr,1fr]">
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={addressForm.label}
                onChange={(e) => setAddressForm((prev) => ({ ...prev, label: e.currentTarget.value }))}
                placeholder={tx("Label (Home/Office)", "Nhan (Nha/Cong ty)")}
                className="w-full rounded-full border border-[color:var(--stroke)] bg-white px-4 py-2 text-sm"
              />
              <label className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm((prev) => ({ ...prev, isDefault: e.currentTarget.checked }))}
                />
                {tx("Set as default", "Dat lam mac dinh")}
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={addressForm.recipientName}
                onChange={(e) => setAddressForm((prev) => ({ ...prev, recipientName: e.currentTarget.value }))}
                placeholder={tx("Recipient name", "Ten nguoi nhan")}
                className="w-full rounded-full border border-[color:var(--stroke)] bg-white px-4 py-2 text-sm"
              />
              <input
                value={addressForm.phone}
                onChange={(e) => setAddressForm((prev) => ({ ...prev, phone: e.currentTarget.value }))}
                placeholder={tx("Phone number", "So dien thoai")}
                className="w-full rounded-full border border-[color:var(--stroke)] bg-white px-4 py-2 text-sm"
              />
            </div>
            <input
              value={addressForm.line1}
              onChange={(e) => setAddressForm((prev) => ({ ...prev, line1: e.currentTarget.value }))}
              placeholder={tx("Address line 1", "Dia chi dong 1")}
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
            />
            <input
              value={addressForm.line2}
              onChange={(e) => setAddressForm((prev) => ({ ...prev, line2: e.currentTarget.value }))}
              placeholder={tx("Address line 2 (optional)", "Dia chi dong 2 (tuy chon)")}
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={addressForm.city}
                onChange={(e) => setAddressForm((prev) => ({ ...prev, city: e.currentTarget.value }))}
                placeholder={tx("City", "Thanh pho")}
                className="w-full rounded-full border border-[color:var(--stroke)] bg-white px-4 py-2 text-sm"
              />
              <input
                value={addressForm.state}
                onChange={(e) => setAddressForm((prev) => ({ ...prev, state: e.currentTarget.value }))}
                placeholder={tx("State/Province", "Tinh/Thanh")}
                className="w-full rounded-full border border-[color:var(--stroke)] bg-white px-4 py-2 text-sm"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={addressForm.postalCode}
                onChange={(e) => setAddressForm((prev) => ({ ...prev, postalCode: e.currentTarget.value }))}
                placeholder={tx("Postal code", "Ma buu dien")}
                className="w-full rounded-full border border-[color:var(--stroke)] bg-white px-4 py-2 text-sm"
              />
              <input
                value={addressForm.country}
                onChange={(e) => setAddressForm((prev) => ({ ...prev, country: e.currentTarget.value }))}
                placeholder={tx("Country", "Quoc gia")}
                className="w-full rounded-full border border-[color:var(--stroke)] bg-white px-4 py-2 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSaveAddress}
                disabled={savingAddress}
                className="rounded-full bg-emerald-700 px-6 py-2 text-sm font-semibold text-white"
              >
                {savingAddress
                  ? tx("Saving...", "Dang luu...")
                  : editingAddressId
                    ? tx("Save address", "Luu dia chi")
                    : tx("Add address", "Them dia chi")}
              </button>
              {editingAddressId && (
                <button
                  type="button"
                  onClick={resetAddressForm}
                  className="rounded-full border border-[color:var(--stroke)] px-6 py-2 text-sm font-semibold text-emerald-900"
                >
                  {tx("Cancel", "Huy")}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {addresses.map((address) => (
              <div key={address.id} className="surface-muted space-y-2 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-emerald-950">
                    {address.label || tx("Address", "Dia chi")}
                  </p>
                  {address.isDefault && (
                    <span className="rounded-full bg-[color:var(--brand-soft)] px-3 py-1 text-[11px] font-semibold text-emerald-900">
                      {tx("Default", "Mac dinh")}
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-800/70">
                  {address.recipientName} Â- {address.phone}
                </p>
                <p className="text-sm text-emerald-900">
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ""}
                </p>
                <p className="text-xs text-emerald-800/70">
                  {address.city} {address.state} {address.postalCode} Â- {address.country}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditAddress(address)}
                    className="rounded-full border border-[color:var(--stroke)] px-3 py-1 text-xs font-semibold text-emerald-900"
                  >
                    {tx("Edit", "Sua")}
                  </button>
                  {!address.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(address)}
                      className="rounded-full border border-[color:var(--stroke)] px-3 py-1 text-xs font-semibold text-emerald-900"
                    >
                      {tx("Set default", "Dat mac dinh")}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteAddress(address.id)}
                    className="rounded-full border border-[color:var(--stroke)] px-3 py-1 text-xs font-semibold text-emerald-900"
                  >
                    {tx("Delete", "Xoa")}
                  </button>
                </div>
              </div>
            ))}
            {addresses.length === 0 && (
              <p className="text-sm text-emerald-800/70">
                {tx("No addresses yet.", "Chua co dia chi nao.")}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}


