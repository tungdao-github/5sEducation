"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clearStoredAuth, resolveApiAsset } from "@/lib/api";
import { useI18n } from "@/app/providers";
import type { HeaderUserProfile } from "@/components/useHeaderAccount";
import HeaderAuthMenu from "@/components/HeaderAuthMenu";

type HeaderAuthProps = {
  compact?: boolean;
  variant?: "pill" | "icon";
  account: {
    isAuthed: boolean;
    isInstructor: boolean;
    user: HeaderUserProfile | null;
  };
};

export function HeaderAuth({ compact, variant = "pill", account }: HeaderAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { tx } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const { isAuthed, isInstructor, user } = account;

  const displayName = useMemo(() => {
    if (!user) return "";
    const full = `${user.firstName} ${user.lastName}`.trim();
    return full || user.email || "";
  }, [user]);

  const initials = useMemo(() => {
    if (!user) return "U";
    const first = user.firstName?.trim()?.[0] ?? "";
    const last = user.lastName?.trim()?.[0] ?? "";
    const letters = `${first}${last}`.trim();
    return letters ? letters.toUpperCase() : (user.email?.trim()?.[0] ?? "U").toUpperCase();
  }, [user]);

  const nextPath = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("auth");
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  const authHref = useCallback(
    (mode: "login" | "register") => `/?auth=${mode}&next=${encodeURIComponent(nextPath || "/")}`,
    [nextPath]
  );

  useEffect(() => {
    if (!menuOpen) return;

    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(event.target as Node)) return;
      setMenuOpen(false);
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  const handleSignOut = () => {
    clearStoredAuth({ notify: false });
    setMenuOpen(false);
    window.dispatchEvent(new Event("auth-changed"));
    router.refresh();
  };

  if (!isAuthed) {
    if (variant === "icon") {
      return (
        <Link href={authHref("login")} className="flex flex-col items-center gap-1 text-[10px] font-semibold text-slate-500">
          <span>{tx("Account", "Tài khoản")}</span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-600">U</span>
        </Link>
      );
    }

    if (compact) {
      return <Link href={authHref("login")} className="text-xs font-semibold text-slate-700">{tx("Sign in", "Đăng nhập")}</Link>;
    }

    return (
      <>
        <Link href={authHref("login")} className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600">
          {tx("Sign in", "Đăng nhập")}
        </Link>
        <Link href={authHref("register")} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
          {tx("Sign up", "Đăng ký")}
        </Link>
      </>
    );
  }

  if (variant === "icon") {
    return (
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex flex-col items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-500"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          {user?.avatarUrl ? <img src={resolveApiAsset(user.avatarUrl)} alt={displayName || "User avatar"} className="h-10 w-10 rounded-full object-cover" /> : <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-700">{initials}</span>}
        </button>
        {menuOpen ? <HeaderAuthMenu displayName={displayName} initials={initials} user={user} isInstructor={isInstructor} onClose={() => setMenuOpen(false)} onSignOut={handleSignOut} /> : null}
      </div>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        className="flex items-center gap-2 transition-opacity hover:opacity-80"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
      >
        {user?.avatarUrl ? <img src={resolveApiAsset(user.avatarUrl)} alt={displayName || "User avatar"} className="h-10 w-10 rounded-full object-cover" /> : <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">{initials}</span>}
      </button>
      {menuOpen ? <HeaderAuthMenu displayName={displayName} initials={initials} user={user} isInstructor={isInstructor} onClose={() => setMenuOpen(false)} onSignOut={handleSignOut} /> : null}
    </div>
  );
}
