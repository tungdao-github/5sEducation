"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  LOCALE_COOKIE_KEY,
  LOCALE_STORAGE_KEY,
  normalizeLocale,
  type AppLocale,
} from "@/lib/i18n";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { InstructorProvider } from "@/contexts/InstructorContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LearningProvider } from "@/contexts/LearningContext";
import { ReviewProvider } from "@/contexts/ReviewContext";
import { translations } from "@/data/translations-extended";

export type { AppLocale } from "@/lib/i18n";

type I18nContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  tx: (en: string, vi: string, es?: string, fr?: string) => string;
  t: (section: string, key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function Providers({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: AppLocale;
}) {
  const [locale, setLocale] = useState<AppLocale>(initialLocale);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncLocale = () => {
      const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      const browserLocale = window.navigator.language;
      const nextLocale = normalizeLocale(storedLocale ?? initialLocale ?? browserLocale);
      setLocale((current) => (current === nextLocale ? current : nextLocale));
    };

    syncLocale();
    window.addEventListener("storage", syncLocale);
    window.addEventListener("locale-changed", syncLocale);
    return () => {
      window.removeEventListener("storage", syncLocale);
      window.removeEventListener("locale-changed", syncLocale);
    };
  }, [initialLocale]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    document.cookie = `${LOCALE_COOKIE_KEY}=${locale}; path=/; max-age=31536000; samesite=lax`;
    window.dispatchEvent(new Event("locale-changed"));
  }, [locale]);

  const t = useMemo<I18nContextValue["t"]>(() => {
    return (section: string, key: string) => {
      const bundle = translations[locale] ?? translations.en;
      const fallbackEn = translations.en;
      const fallbackVi = translations.vi;
      const currentSection = bundle[section as keyof typeof bundle] as Record<string, string> | undefined;
      if (currentSection?.[key]) return currentSection[key];
      const enSection = fallbackEn[section as keyof typeof fallbackEn] as Record<string, string> | undefined;
      if (enSection?.[key]) return enSection[key];
      const viSection = fallbackVi[section as keyof typeof fallbackVi] as Record<string, string> | undefined;
      if (viSection?.[key]) return viSection[key];
      return key;
    };
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      tx: (en: string, vi: string, es?: string, fr?: string) => {
        if (locale === "vi") return vi;
        if (locale === "es") return es ?? en;
        if (locale === "fr") return fr ?? en;
        return en;
      },
      t,
    }),
    [locale, t]
  );

  return (
    <I18nContext.Provider value={value}>
      <LanguageProvider initialLanguage={locale}>
        <AuthProvider>
          <InstructorProvider>
            <LearningProvider>
              <CartProvider>
                <WishlistProvider>
                  <ReviewProvider>{children}</ReviewProvider>
                </WishlistProvider>
              </CartProvider>
            </LearningProvider>
          </InstructorProvider>
        </AuthProvider>
      </LanguageProvider>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside Providers.");
  }

  return context;
}
