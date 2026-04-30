"use client";

import type { AuthMode } from "@/components/AuthModalBody";

type Props = {
  mode: AuthMode;
  tx: (en: string, vi: string) => string;
  error: string;
  successMessage: string;
  confirmLink: string;
  resetLink: string;
  needsConfirmation: boolean;
};

export default function AuthModalNotice({
  mode,
  tx,
  error,
  successMessage,
  confirmLink,
  resetLink,
  needsConfirmation,
}: Props) {
  if (mode === "confirm-email") {
    return null;
  }

  return (
    <>
      {error ? <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {needsConfirmation ? (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p>{tx("Please confirm your email to sign in.", "Vui lòng xác thực email để đăng nhập.")}</p>
        </div>
      ) : null}

      {successMessage ? (
        <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <p>{successMessage}</p>
          {confirmLink ? (
            <a href={confirmLink} className="mt-2 inline-flex text-xs font-semibold text-emerald-700 underline">
              {tx("Open confirmation link (dev)", "Mở liên kết xác thực (dev)")}
            </a>
          ) : null}
          {resetLink ? (
            <a href={resetLink} className="mt-2 inline-flex text-xs font-semibold text-emerald-700 underline">
              {tx("Open reset link (dev)", "Mở liên kết đặt lại (dev)")}
            </a>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
