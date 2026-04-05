"use client";

import Link from "next/link";
import { useState } from "react";
import { API_URL } from "@/lib/api";
import { useI18n } from "@/app/providers";

export default function ForgotPasswordPage() {
  const { tx } = useI18n();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [resetLink, setResetLink] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setResetLink("");

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          resetUrl: `${window.location.origin}/reset-password`,
        }),
      });

      const data = res.ok ? await res.json() : null;
      setMessage(
        tx(
          "If the email exists, a reset link was sent. Check your inbox.",
          "Neu email ton tai, lien ket dat lai mat khau da duoc gui."
        )
      );
      if (data?.resetLink) {
        setResetLink(String(data.resetLink));
      }
    } catch {
      setMessage(tx("Something went wrong.", "Co loi xay ra."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-shell py-16 fade-in">
      <div className="surface-card mx-auto max-w-md p-8">
        <h1 className="section-title text-3xl font-semibold text-emerald-950">
          {tx("Reset your password", "Dat lai mat khau")}
        </h1>
        <p className="mt-2 text-sm text-emerald-800/70">
          {tx(
            "Enter your email and we will send a reset link.",
            "Nhap email de nhan lien ket dat lai mat khau."
          )}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="reset-email" className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("Email", "Email")}
            </label>
            <input
              id="reset-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm text-emerald-950 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white"
          >
            {loading ? tx("Sending...", "Dang gui...") : tx("Send reset link", "Gui lien ket")}
          </button>
        </form>

        {message && (
          <div className="mt-4 surface-muted px-4 py-3 text-sm text-emerald-800">
            {message}
          </div>
        )}

        {resetLink && (
          <div className="mt-4 space-y-2 rounded-2xl border border-[color:var(--stroke)] bg-white/80 px-4 py-3 text-xs text-emerald-900">
            <p className="font-semibold">{tx("Dev reset link", "Lien ket dev")}:</p>
            <a href={resetLink} className="break-all text-emerald-700 underline">
              {resetLink}
            </a>
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

