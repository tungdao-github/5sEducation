"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { normalizeLocale, type AppLocale } from "@/lib/i18n";

export type { AppLocale } from "@/lib/i18n";

type I18nContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  tx: (en: string, vi: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);
const LOCALE_STORAGE_KEY = "app:locale";
const LOCALE_COOKIE_KEY = "app_locale";

export function Providers({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<AppLocale>("en");

  useEffect(() => {
    const storedLocale =
      typeof window !== "undefined"
        ? window.localStorage.getItem(LOCALE_STORAGE_KEY)
        : null;
    const browserLocale =
      typeof navigator !== "undefined" ? navigator.language : null;

    setLocale(normalizeLocale(storedLocale ?? browserLocale));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    document.cookie = `${LOCALE_COOKIE_KEY}=${locale}; path=/; max-age=31536000; samesite=lax`;
    window.dispatchEvent(new Event("locale-changed"));
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      tx: (en: string, vi: string) => (locale === "vi" ? vi : en),
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside Providers.");
  }

  return context;
}
