"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { translations, type Language } from '../data/translations-extended';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (section: string, key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('language') as Language | null;
    if (stored) setLanguage(stored);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  const t = (section: string, key: string): string => {
    const sectionData = (translations[language] as any)?.[section];
    if (sectionData && sectionData[key]) return sectionData[key];
    const enSection = (translations.en as any)[section];
    const viSection = (translations.vi as any)[section];
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
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
