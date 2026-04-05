"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { API_URL } from "@/lib/api";
import { useI18n } from "@/app/providers";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";
  const { tx } = useI18n();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmLink, setConfirmLink] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!agreed) {
      setError(tx("Please accept the terms to continue.", "Vui long dong y dieu khoan de tiep tuc."));
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMessage("");
    setConfirmLink("");

    try {
      const parts = name.trim().split(/\s+/).filter(Boolean);
      const firstName = parts[0] ?? "";
      const lastName = parts.slice(1).join(" ") || firstName;

      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      if (!res.ok) {
        let message = tx("Registration failed. Please try again.", "Dang ky that bai. Vui long thu lai.");
        try {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            message = data.join("\n");
          } else if (typeof data === "string") {
            message = data;
          }
        } catch {
          // ignore parse errors
        }
        throw new Error(message);
      }

      let message = tx("Account created. Please confirm your email.", "Tao tai khoan thanh cong. Vui long xac thuc email.");
      try {
        const data = await res.json();
        if (typeof data?.message === "string") {
          message = data.message;
        }
        if (typeof data?.confirmLink === "string") {
          setConfirmLink(data.confirmLink);
        }
      } catch {
        // ignore parse errors
      }

      setSuccessMessage(message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : tx("Registration failed. Please try again.", "Dang ky that bai. Vui long thu lai.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-shell py-16 fade-in">
      <div className="surface-card mx-auto max-w-md p-8">
        <h1 className="section-title text-3xl font-semibold text-emerald-950">
          {tx("Create an account", "Tao tai khoan")}
        </h1>
        <p className="mt-2 text-sm text-emerald-800/70">
          {tx("Start your learning journey in minutes.", "Bat dau hanh trinh hoc tap chi trong vai phut.")}
        </p>

        <div className="surface-muted mt-4 p-4">
          <GoogleSignInButton nextPath={nextPath} mode="signup" />
        </div>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-emerald-700/70">
          <span className="h-px flex-1 bg-[color:var(--stroke)]" />
          <span>{tx("Or sign up with email", "Hoac dang ky bang email")}</span>
          <span className="h-px flex-1 bg-[color:var(--stroke)]" />
        </div>

        {error && (
          <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {successMessage && (
          <div className="mt-4 surface-muted px-4 py-3 text-sm text-emerald-800">
            <p>{successMessage}</p>
            {confirmLink && (
              <a
                href={confirmLink}
                className="mt-2 inline-flex text-xs font-semibold text-emerald-700 underline"
              >
                {tx("Open confirmation link (dev)", "Mo link xac thuc (dev)")}
              </a>
            )}
            <p className="mt-2">
              <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="font-semibold text-emerald-900">
                {tx("Go to sign in", "Den trang dang nhap")}
              </Link>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="register-name" className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("Full name", "Ho va ten")}
            </label>
            <input
              id="register-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm text-emerald-950 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="register-email" className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("Email", "Email")}
            </label>
            <input
              id="register-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm text-emerald-950 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="register-password"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700"
            >
              {tx("Password", "Mat khau")}
            </label>
            <input
              id="register-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm text-emerald-950 focus:outline-none"
            />
          </div>

          <label className="flex items-start gap-3 text-xs text-emerald-800/70">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.currentTarget.checked)}
              className="mt-1"
            />
            <span>
              {tx("I agree to the", "Toi dong y voi")}{" "}
              <Link href="/policy" className="font-semibold text-emerald-900 underline-hover">
                {tx("Terms & Privacy Policy", "Dieu khoan & Bao mat")}
              </Link>
              .
            </span>
          </label>

          <button
            type="submit"
            disabled={loading || !agreed}
            className="w-full rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white"
          >
            {loading ? tx("Creating...", "Dang tao...") : tx("Create account", "Tao tai khoan")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-emerald-800/70">
          {tx("Already have an account?", "Da co tai khoan?")}{" "}
          <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="font-semibold text-emerald-900">
            {tx("Sign in", "Dang nhap")}
          </Link>
        </p>
      </div>
    </div>
  );
}

