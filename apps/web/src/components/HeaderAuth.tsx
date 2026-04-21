"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clearStoredAuth, resolveApiAsset } from "@/lib/api";
import { useI18n } from "@/app/providers";
import type { HeaderUserProfile } from "@/components/useHeaderAccount";

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
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
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
          <span>{tx("Account", "Tai khoan")}</span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-600">U</span>
        </Link>
      );
    }

    if (compact) {
      return <Link href={authHref("login")} className="text-xs font-semibold text-slate-700">{tx("Sign in", "Dang nhap")}</Link>;
    }

    return (
      <>
        <Link href={authHref("login")} className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600">
          {tx("Sign in", "Dang nhap")}
        </Link>
        <Link href={authHref("register")} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
          {tx("Sign up", "Dang ky")}
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
          {user?.avatarUrl ? (
            <img src={resolveApiAsset(user.avatarUrl)} alt={displayName || "User avatar"} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-700">{initials}</span>
          )}
        </button>
        {menuOpen && (
          <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-slate-900">{displayName || tx("Account", "Tai khoan")}</p>
              {user?.email && <p className="text-[11px] text-slate-500">{user.email}</p>}
            </div>
            <div className="my-2 h-px bg-slate-100" />
            <button type="button" onClick={handleSignOut} className="w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100">
              {tx("Sign out", "Dang xuat")}
            </button>
          </div>
        )}
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
        {user?.avatarUrl ? (
          <img
            src={resolveApiAsset(user.avatarUrl)}
            alt={displayName || "User avatar"}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
            {initials}
          </span>
        )}
      </button>

      {menuOpen && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="font-semibold text-gray-900">{displayName || tx("Account", "Tai khoan")}</p>
            {user?.email && <p className="truncate text-xs text-gray-500">{user.email}</p>}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-semibold text-sky-400">⭐ {user?.loyaltyTier || "Bronze"}</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs font-medium text-blue-600">{user?.loyaltyPoints ?? 0} điểm</span>
            </div>
          </div>
          <div className="px-1 py-1">
            <Link href="/my-learning" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600" onClick={() => setMenuOpen(false)}>
              {tx("My Learning", "Khóa học của tôi")}
            </Link>
            <Link href="/account" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600" onClick={() => setMenuOpen(false)}>
              {tx("Account", "Tài khoản")}
            </Link>
            <Link href="/wishlist" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600" onClick={() => setMenuOpen(false)}>
              {tx("Wishlist", "Yêu thích")}
            </Link>
            <Link href="/cart" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600" onClick={() => setMenuOpen(false)}>
              {tx("Cart", "Giỏ hàng")}
            </Link>
          </div>
          <div className="my-2 border-t border-gray-100" />
          <div className="px-1 py-1">
            {isInstructor ? (
              <Link href="/instructor" className="flex items-center gap-3 px-3 py-2.5 text-sm text-green-600 transition-colors hover:bg-green-50" onClick={() => setMenuOpen(false)}>
                {tx("Dashboard Giảng viên", "Dashboard Giảng viên")}
              </Link>
            ) : (
              <Link href="/become-instructor" className="flex items-center gap-3 px-3 py-2.5 text-sm text-purple-600 transition-colors hover:bg-purple-50" onClick={() => setMenuOpen(false)}>
                {tx("Trở thành Giảng viên", "Trở thành Giảng viên")}
              </Link>
            )}
            {user?.isAdmin && (
              <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 text-sm text-purple-600 transition-colors hover:bg-purple-50" onClick={() => setMenuOpen(false)}>
                {tx("Quản trị Admin", "Quản trị Admin")}
              </Link>
            )}
          </div>
          <div className="my-2 border-t border-gray-100" />
          <button type="button" onClick={handleSignOut} className="w-full px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50">
            {tx("Sign out", "Dang xuat")}
          </button>
        </div>
      )}
    </div>
  );
}
