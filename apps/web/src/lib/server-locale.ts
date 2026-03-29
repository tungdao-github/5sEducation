import { cookies } from "next/headers";
import { normalizeLocale, type AppLocale } from "@/lib/i18n";

const LOCALE_COOKIE_KEY = "app_locale";

export async function getServerLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(LOCALE_COOKIE_KEY)?.value);
}
