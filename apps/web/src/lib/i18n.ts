export type AppLocale = "en" | "vi" | "es" | "fr";

export function normalizeLocale(value?: string | null): AppLocale {
  if (!value) {
    return "en";
  }

  const normalized = value.toLowerCase();
  if (normalized.startsWith("vi")) return "vi";
  if (normalized.startsWith("es")) return "es";
  if (normalized.startsWith("fr")) return "fr";
  return "en";
}

export function pickLocaleText(locale: AppLocale, en: string, vi: string, es?: string, fr?: string) {
  if (locale === "vi") return vi;
  if (locale === "es") return es ?? en;
  if (locale === "fr") return fr ?? en;
  return en;
}
