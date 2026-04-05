"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/app/providers";
import { notify } from "@/lib/notify";
import { COMPARE_EVENT, readCompareIds, writeCompareIds } from "@/lib/compare";

export function CompareToggle({ courseId }: { courseId: number }) {
  const { tx } = useI18n();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const sync = () => {
      const ids = readCompareIds();
      setActive(ids.includes(courseId));
    };

    sync();
    window.addEventListener(COMPARE_EVENT, sync);
    return () => window.removeEventListener(COMPARE_EVENT, sync);
  }, [courseId]);

  const toggle = () => {
    const ids = readCompareIds();
    if (ids.includes(courseId)) {
      writeCompareIds(ids.filter((id) => id !== courseId));
      return;
    }

    if (ids.length >= 3) {
      notify({
        title: tx("Compare limit reached", "Da dat gioi han so sanh"),
        message: tx("You can compare up to 3 courses.", "Chi so sanh toi da 3 khoa hoc."),
      });
      return;
    }

    writeCompareIds([...ids, courseId]);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
        active ? "border-[color:var(--brand)] bg-emerald-700 text-white" : "border-[color:var(--stroke)] text-emerald-900"
      }`}
    >
      {active ? tx("Added", "Da them") : tx("Compare", "So sanh")}
    </button>
  );
}


