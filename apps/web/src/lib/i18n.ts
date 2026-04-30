export type AppLocale = "en" | "vi" | "es" | "fr";

export const SUPPORTED_LOCALES: AppLocale[] = ["en", "vi", "es", "fr"];
export const DEFAULT_LOCALE: AppLocale = "en";
export const LOCALE_COOKIE_KEY = "app_locale";
export const LOCALE_STORAGE_KEY = "app:locale";

export function normalizeLocale(value?: string | null): AppLocale {
  if (!value) {
    return DEFAULT_LOCALE;
  }

  const normalized = value.toLowerCase();
  if (normalized.startsWith("vi")) return "vi";
  if (normalized.startsWith("es")) return "es";
  if (normalized.startsWith("fr")) return "fr";
  return DEFAULT_LOCALE;
}

export function pickLocaleText(locale: AppLocale, en: string, vi: string, es?: string, fr?: string) {
  if (locale === "vi") return vi;
  if (locale === "es") return es ?? en;
  if (locale === "fr") return fr ?? en;
  return en;
}

export function detectLocaleFromAcceptLanguage(header?: string | null): AppLocale {
  if (!header) return DEFAULT_LOCALE;

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, qValue] = part.trim().split(";q=");
      const q = qValue ? Number.parseFloat(qValue) : 1;
      return { tag: tag.toLowerCase(), q: Number.isFinite(q) ? q : 0 };
    })
    .sort((a, b) => b.q - a.q);

  for (const item of ranked) {
    const normalized = normalizeLocale(item.tag);
    if (SUPPORTED_LOCALES.includes(normalized)) {
      return normalized;
    }
  }

  return DEFAULT_LOCALE;
}
