"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="vi">
      <body className="page-shell">
        <div className="section-shell flex min-h-screen items-center justify-center py-16">
          <div className="surface-card max-w-xl rounded-3xl p-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Error</p>
            <h2 className="mt-3 text-3xl font-semibold text-emerald-950">He thong gap su co</h2>
            <p className="mt-3 text-sm text-emerald-800/70">
              Vui long tai lai trang hoac thu lai sau.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white"
            >
              Tai lai
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}