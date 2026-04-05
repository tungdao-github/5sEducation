"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import { useI18n } from "@/app/providers";

type Status = "idle" | "loading" | "success" | "error";

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams();
  const { tx } = useI18n();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const userId = searchParams.get("userId");
    const token = searchParams.get("token");

    if (!userId || !token) {
      setStatus("error");
      setMessage(tx("Missing confirmation data.", "Thieu thong tin xac thuc."));
      return;
    }

    const confirm = async () => {
      setStatus("loading");
      try {
        const res = await fetch(`${API_URL}/api/auth/confirm-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, token }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const detail =
            typeof data?.title === "string"
              ? data.title
              : tx("Email confirmation failed.", "Xac thuc email that bai.");
          throw new Error(detail);
        }
        setStatus("success");
        setMessage(data?.message ?? tx("Email confirmed.", "Da xac thuc email."));
      } catch (err) {
        setStatus("error");
        setMessage(
          err instanceof Error
            ? err.message
            : tx("Email confirmation failed.", "Xac thuc email that bai.")
        );
      }
    };

    confirm();
  }, [searchParams, tx]);

  return (
    <div className="section-shell py-20 fade-in">
      <div className="surface-card rounded-3xl p-10 text-center">
        <h1 className="section-title text-3xl font-semibold text-emerald-950">
          {tx("Confirm email", "Xac thuc email")}
        </h1>

        {status === "loading" && (
          <p className="mt-4 text-sm text-emerald-800/70">
            {tx("Verifying your email...", "Dang xac thuc email...")}
          </p>
        )}

        {status === "success" && (
          <div className="mt-4 text-sm text-emerald-800">
            <p>{message}</p>
            <Link href="/login" className="mt-4 inline-flex font-semibold text-emerald-900 underline">
              {tx("Go to sign in", "Den trang dang nhap")}
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="mt-4 text-sm text-red-700">
            <p>{message}</p>
            <Link href="/login" className="mt-4 inline-flex font-semibold text-emerald-900 underline">
              {tx("Go to sign in", "Den trang dang nhap")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
