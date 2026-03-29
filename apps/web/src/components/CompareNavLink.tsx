"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/app/providers";
import { COMPARE_EVENT, readCompareIds } from "@/lib/compare";

export function CompareNavLink({ compact }: { compact?: boolean }) {
  const { tx } = useI18n();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(readCompareIds().length);
    sync();
    window.addEventListener(COMPARE_EVENT, sync);
    return () => window.removeEventListener(COMPARE_EVENT, sync);
  }, []);

  return (
    <Link href="/compare" className={compact ? "" : "underline-hover"}>
      <span className="inline-flex items-center gap-2">
        {tx("Compare", "So sanh")}
        {count > 0 && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
            {count}
          </span>
        )}
      </span>
    </Link>
  );
}
