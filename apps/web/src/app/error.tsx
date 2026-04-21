"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="section-shell flex min-h-[60vh] items-center justify-center py-16">
      <div className="surface-card max-w-xl rounded-3xl p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Error</p>
        <h2 className="mt-3 text-3xl font-semibold text-emerald-950">Co loi xay ra</h2>
        <p className="mt-3 text-sm text-emerald-800/70">
          Chuc nang nay tam thoi khong the tai duoc. Vui long thu lai.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white"
        >
          Thu lai
        </button>
      </div>
    </div>
  );
}