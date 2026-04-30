"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { normalizeLocale, LOCALE_COOKIE_KEY, LOCALE_STORAGE_KEY, type AppLocale } from "@/lib/i18n";
import { translations } from "@/data/translations-extended";

type TranslationBundle = (typeof translations)[AppLocale];
type TranslationSectionMap = Record<string, string>;

interface LanguageContextType {
  language: AppLocale;
  setLanguage: (lang: AppLocale) => void;
  t: (section: string, key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children, initialLanguage }: { children: ReactNode; initialLanguage: AppLocale }) {
  const [language, setLanguage] = useState<AppLocale>(initialLanguage);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncLanguage = () => {
      const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      const nextLanguage = normalizeLocale(stored ?? initialLanguage ?? window.navigator.language);
      setLanguage((current) => (current === nextLanguage ? current : nextLanguage));
    };

    syncLanguage();
    window.addEventListener("storage", syncLanguage);
    window.addEventListener("locale-changed", syncLanguage);
    return () => {
      window.removeEventListener("storage", syncLanguage);
      window.removeEventListener("locale-changed", syncLanguage);
    };
  }, []);

  const handleSetLanguage = (lang: AppLocale) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, lang);
      window.document.documentElement.lang = lang;
      window.document.cookie = `${LOCALE_COOKIE_KEY}=${lang}; path=/; max-age=31536000; samesite=lax`;
      window.dispatchEvent(new Event("locale-changed"));
    }
  };

  const getSection = (bundle: TranslationBundle, section: string): TranslationSectionMap | undefined => {
    const candidate = bundle[section as keyof TranslationBundle];
    if (!candidate || typeof candidate !== "object") {
      return undefined;
    }
    return candidate as TranslationSectionMap;
  };

  const t = (section: string, key: string): string => {
    const sectionData = getSection(translations[language], section);
    if (sectionData && sectionData[key]) return sectionData[key];
    const enSection = getSection(translations.en, section);
    const viSection = getSection(translations.vi, section);
    return enSection?.[key] || viSection?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
