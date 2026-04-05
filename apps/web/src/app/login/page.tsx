"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { API_URL } from "@/lib/api";
import { useI18n } from "@/app/providers";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";
  const { tx } = useI18n();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNeedsConfirmation(false);
    setResendMessage("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        let message = tx("Invalid email or password", "Email hoac mat khau khong dung");
        try {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            message = data.join("\n");
          } else if (typeof data === "string") {
            message = data;
          } else if (typeof data?.title === "string") {
            message = data.title;
          }
        } catch {
          // ignore parse errors
        }
        if (res.status === 403) {
          setNeedsConfirmation(true);
        }
        throw new Error(message);
      }

      const data = await res.json();
      const token = data?.token ?? data?.Token;
      if (!token) {
        throw new Error(tx("Login failed: missing token.", "Dang nhap that bai: thieu token."));
      }

      localStorage.setItem("token", token);
      window.dispatchEvent(new Event("auth-changed"));
      router.push(nextPath);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : tx("Invalid email or password", "Email hoac mat khau khong dung")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResendMessage("");
    try {
      const res = await fetch(`${API_URL}/api/auth/resend-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data?.title === "string"
            ? data.title
            : tx("Unable to resend confirmation.", "Khong the gui lai xac thuc.")
        );
      }
      setResendMessage(data?.message ?? tx("Confirmation email sent.", "Da gui lai email xac thuc."));
    } catch (err) {
      setResendMessage(
        err instanceof Error
          ? err.message
          : tx("Unable to resend confirmation.", "Khong the gui lai xac thuc.")
      );
    }
  };

  return (
    <div className="section-shell py-16 fade-in">
      <div className="surface-card mx-auto max-w-md p-8">
        <h1 className="section-title text-3xl font-semibold text-emerald-950">
          {tx("Welcome back", "Chao mung tro lai")}
        </h1>
        <p className="mt-2 text-sm text-emerald-800/70">
          {tx("Sign in to continue your learning journey.", "Dang nhap de tiep tuc hanh trinh hoc tap.")}
        </p>

        <div className="surface-muted mt-4 p-4">
          <GoogleSignInButton nextPath={nextPath} mode="signin" />
        </div>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-emerald-700/70">
          <span className="h-px flex-1 bg-[color:var(--stroke)]" />
          <span>{tx("Or continue with email", "Hoac dang nhap bang email")}</span>
          <span className="h-px flex-1 bg-[color:var(--stroke)]" />
        </div>

        {error && (
          <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {needsConfirmation && (
          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p>{tx("Please confirm your email to sign in.", "Vui long xac thuc email de dang nhap.")}</p>
            <button
              type="button"
              onClick={handleResend}
              className="mt-2 inline-flex text-xs font-semibold text-amber-800 underline"
            >
              {tx("Resend confirmation email", "Gui lai email xac thuc")}
            </button>
            {resendMessage && <p className="mt-2 text-xs text-amber-800/80">{resendMessage}</p>}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("Email", "Email")}
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm text-emerald-950 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="login-password"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700"
            >
              {tx("Password", "Mat khau")}
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm text-emerald-950 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white"
          >
            {loading ? tx("Signing in...", "Dang dang nhap...") : tx("Sign in", "Dang nhap")}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-emerald-800/70">
          <Link href="/forgot-password" className="font-semibold text-emerald-900">
            {tx("Forgot password?", "Quen mat khau?")}
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-emerald-800/70">
          {tx("No account yet?", "Chua co tai khoan?")}{" "}
          <Link href={`/register?next=${encodeURIComponent(nextPath)}`} className="font-semibold text-emerald-900">
            {tx("Create one", "Tao tai khoan")}
          </Link>
        </p>
      </div>
    </div>
  );
}
