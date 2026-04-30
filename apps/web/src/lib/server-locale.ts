import { cookies, headers } from "next/headers";
import {
  detectLocaleFromAcceptLanguage,
  LOCALE_COOKIE_KEY,
  normalizeLocale,
  type AppLocale,
} from "@/lib/i18n";

export async function getServerLocale(): Promise<AppLocale> {
  const headerStore = await headers();
  const headerLocale = headerStore.get("x-app-locale");
  if (headerLocale) {
    return normalizeLocale(headerLocale);
  }

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(LOCALE_COOKIE_KEY)?.value;
  if (cookieValue) {
    return normalizeLocale(cookieValue);
  }

  return detectLocaleFromAcceptLanguage(headerStore.get("accept-language"));
}
