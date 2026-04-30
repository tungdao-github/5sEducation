import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_KEY,
  SUPPORTED_LOCALES,
  normalizeLocale,
} from "@/lib/i18n";

const PUBLIC_FILE = /\.(.*)$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const pathLocale = pathname.split("/")[1];
  const hasLocalePrefix = SUPPORTED_LOCALES.includes(pathLocale as (typeof SUPPORTED_LOCALES)[number]);

  if (hasLocalePrefix) {
    const locale = normalizeLocale(pathLocale);
    const url = request.nextUrl.clone();
    url.pathname = pathname === `/${pathLocale}` ? "/" : pathname.replace(`/${pathLocale}`, "") || "/";

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-app-locale", locale);

    const response = NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });
    response.cookies.set(LOCALE_COOKIE_KEY, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  }

  const cookieLocale = normalizeLocale(request.cookies.get(LOCALE_COOKIE_KEY)?.value);
  const locale = cookieLocale || DEFAULT_LOCALE;
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  const response = NextResponse.redirect(url);
  response.cookies.set(LOCALE_COOKIE_KEY, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api).*)"],
};
