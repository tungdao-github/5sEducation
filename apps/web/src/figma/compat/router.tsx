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

export function Link({ to, ...props }: { to: string } & Omit<ComponentProps<typeof NextLink>, "href">) {
  return <NextLink href={to} {...props} />;
}

export function useNavigate() {
  const router = useRouter();
  return (to: string) => {
    router.push(to);
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
  const pathname = usePathname() ?? "";
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
    router.push(query ? `${pathname}?${query}` : pathname);
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
  useEffect(() => {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [router, replace, to]);
  return null;
}

export function Outlet({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
