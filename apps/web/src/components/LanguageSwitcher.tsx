"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n, type AppLocale } from "@/app/providers";

type LanguageSwitcherProps = {
  compact?: boolean;
  variant?: "pill" | "icon";
};

export function LanguageSwitcher({ compact, variant = "pill" }: LanguageSwitcherProps) {
  const router = useRouter();
  const { locale, setLocale, tx } = useI18n();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleChange = (nextLocale: AppLocale) => {
    if (nextLocale === locale) {
      return;
    }

    setLocale(nextLocale);
    router.refresh();
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(event.target as Node)) return;
      setOpen(false);
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  if (variant === "icon") {
    return (
      <div ref={menuRef} className="relative flex flex-col items-center gap-1 text-[10px] font-semibold text-slate-500">
        {!compact && <span>{tx("Language", "Ngon ngu")}</span>}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={tx("Language", "Ngon ngu")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="12" cy="12" r="8" />
            <path d="M4 12h16" strokeLinecap="round" />
            <path d="M12 4a12 12 0 0 1 0 16a12 12 0 0 1 0-16z" strokeLinecap="round" />
          </svg>
        </button>
        {open && (
          <div className="absolute right-0 top-full z-50 mt-2 w-40 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
            <button
              type="button"
              onClick={() => handleChange("en")}
              className={`w-full rounded-xl px-3 py-2 text-left text-xs font-semibold ${
                locale === "en" ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => handleChange("vi")}
              className={`mt-1 w-full rounded-xl px-3 py-2 text-left text-xs font-semibold ${
                locale === "vi" ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Tieng Viet
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700">
      {!compact && (
        <span className="px-1 text-[10px] uppercase tracking-[0.16em] text-slate-500">
          {tx("Lang", "Ngon ngu")}
        </span>
      )}
      <button
        type="button"
        onClick={() => handleChange("en")}
        className={`rounded-full px-2 py-1 ${
          locale === "en"
            ? "bg-blue-600 text-white"
            : "text-slate-700 hover:bg-slate-100"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => handleChange("vi")}
        className={`rounded-full px-2 py-1 ${
          locale === "vi"
            ? "bg-blue-600 text-white"
            : "text-slate-700 hover:bg-slate-100"
        }`}
      >
        VI
      </button>
    </div>
  );
}
