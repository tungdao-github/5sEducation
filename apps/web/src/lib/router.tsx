"use client";

import type { ComponentProps, ReactNode } from "react";
import { useEffect, useMemo } from "react";
import NextLink from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
  useParams as useNextParams,
} from "next/navigation";
import { normalizeLocale, SUPPORTED_LOCALES, type AppLocale } from "@/lib/i18n";

function isExternalOrHash(to: string) {
  return (
    to.startsWith("http://") ||
    to.startsWith("https://") ||
    to.startsWith("#") ||
    to.startsWith("mailto:")
  );
}

function stripLocalePrefix(pathname: string) {
  const segments = pathname.split("/");
  const maybeLocale = segments[1];
  if (SUPPORTED_LOCALES.includes(maybeLocale as AppLocale)) {
    const rest = `/${segments.slice(2).join("/")}`.replace(/\/+$/, "");
    return rest === "" ? "/" : rest;
  }
  return pathname;
}

function getCurrentLocaleFromPath(pathname: string): AppLocale {
  const maybeLocale = pathname.split("/")[1];
  return normalizeLocale(maybeLocale);
}

function withLocalePrefix(to: string, pathname: string) {
  if (isExternalOrHash(to)) return to;
  if (to.startsWith("/api/") || to.startsWith("/_next/")) return to;

  const currentLocale = getCurrentLocaleFromPath(pathname);
  const normalizedTo = to.startsWith("/") ? to : `/${to}`;
  const stripped = stripLocalePrefix(normalizedTo);

  if (stripped === "/") {
    return `/${currentLocale}`;
  }

  return `/${currentLocale}${stripped}`;
}

export function Link({ to, ...props }: { to: string } & Omit<ComponentProps<typeof NextLink>, "href">) {
  const pathname = usePathname() ?? "/";
  return <NextLink href={withLocalePrefix(to, pathname)} {...props} />;
}

export function useNavigate() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  return (to: string) => {
    router.push(withLocalePrefix(to, pathname));
  };
}

export function useLocation() {
  const pathname = usePathname() ?? "";
  const searchParams = useNextSearchParams();
  const search = searchParams?.toString();

  return useMemo(
    () => ({
      pathname,
      search: search ? `?${search}` : "",
      hash: "",
    }),
    [pathname, search]
  );
}

export function useSearchParams(): [URLSearchParams, (next: Record<string, string>) => void] {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const searchParams = useNextSearchParams();
  const currentParams = useMemo(
    () => new URLSearchParams(searchParams?.toString() ?? ""),
    [searchParams]
  );

  const setSearchParams = (next: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => {
      if (!value) return;
      params.set(key, value);
    });
    const query = params.toString();
    const target = withLocalePrefix(pathname, pathname);
    router.push(query ? `${target}?${query}` : target);
  };

  return [currentParams, setSearchParams];
}

export function useParams() {
  const params = (useNextParams() ?? {}) as Record<string, string>;
  if (params.slug && !params.id) {
    return { ...params, id: params.slug };
  }
  return params;
}

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  useEffect(() => {
    const target = withLocalePrefix(to, pathname);
    if (replace) {
      router.replace(target);
    } else {
      router.push(target);
    }
  }, [pathname, replace, router, to]);
  return null;
}

export function Outlet({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
