export type AppLocale = "en" | "vi";

export function normalizeLocale(value?: string | null): AppLocale {
  if (!value) {
    return "en";
  }

  return value.toLowerCase().startsWith("vi") ? "vi" : "en";
}

export function pickLocaleText(locale: AppLocale, en: string, vi: string) {
  return locale === "vi" ? vi : en;
}
