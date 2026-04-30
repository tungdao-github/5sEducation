"use client";

type Props = {
  loading: boolean;
  error: string;
  successMessage: string;
  tx: (en: string, vi: string) => string;
  onGoHome: () => void;
};

export function AuthModalConfirmState({ loading, error, successMessage, tx, onGoHome }: Props) {
  return (
    <div className="space-y-4 text-sm">
      {loading ? <p className="text-center text-slate-600">{tx("Verifying your email...", "Đang xác thực email...")}</p> : null}
      {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</div> : null}
      {successMessage ? (
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700">
          <p>{successMessage}</p>
          <button type="button" onClick={onGoHome} className="mt-3 inline-flex font-semibold text-emerald-900 underline">
            {tx("Go to sign in", "Đến trang đăng nhập")}
          </button>
        </div>
      ) : null}
      {!loading && !successMessage && !error ? <div className="rounded-2xl bg-slate-50 px-4 py-3 text-slate-700">{tx("Open the confirmation link from your email to continue.", "Mở liên kết xác thực trong email để tiếp tục.")}</div> : null}
    </div>
  );
}
