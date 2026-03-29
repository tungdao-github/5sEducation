"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { API_URL, resolveApiAsset } from "@/lib/api";
import { useI18n } from "@/app/providers";

type HeaderAuthProps = {
  compact?: boolean;
  variant?: "pill" | "icon";
};

type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  isAdmin: boolean;
};

export function HeaderAuth({ compact, variant = "pill" }: HeaderAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { tx } = useI18n();
  const [isAuthed, setIsAuthed] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  const loadProfile = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = (await res.json()) as UserProfile;
      setUser(data);
    } catch {
      setUser(null);
    }
  };

  const syncAuth = () => {
    const token = localStorage.getItem("token");
    const authed = Boolean(token);
    setIsAuthed(authed);
    if (!authed) {
      setUser(null);
      setMenuOpen(false);
      return;
    }
    if (token) {
      loadProfile(token);
    }
  };

  useEffect(() => {
    syncAuth();

    window.addEventListener("storage", syncAuth);
    window.addEventListener("auth-changed", syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("auth-changed", syncAuth);
    };
  }, []);

  useEffect(() => {
    syncAuth();
  }, [pathname]);

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
    localStorage.removeItem("token");
    setIsAuthed(false);
    setUser(null);
    setMenuOpen(false);
    window.dispatchEvent(new Event("auth-changed"));
    router.refresh();
  };

  if (!isAuthed) {
    if (variant === "icon") {
      return (
        <Link
          href="/login"
          className="flex flex-col items-center gap-1 text-[10px] font-semibold text-slate-500"
        >
          <span>{tx("Account", "Tai khoan")}</span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-600">
            U
          </span>
        </Link>
      );
    }

    if (compact) {
      return (
        <Link href="/login" className="text-xs font-semibold text-slate-700">
          {tx("Sign in", "Dang nhap")}
        </Link>
      );
    }

    return (
      <>
        <Link
          href="/login"
          className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
        >
          {tx("Sign in", "Dang nhap")}
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
        >
          {tx("Sign up", "Dang ky")}
        </Link>
      </>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        className={`flex items-center gap-2 ${
          variant === "icon"
            ? "flex-col rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-500"
            : "rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700"
        } ${variant === "icon" ? "" : compact ? "pr-2" : "pr-3"}`}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
      >
        {variant === "icon" && !compact && <span>{tx("Account", "Tai khoan")}</span>}
        {user?.avatarUrl ? (
          <img
            src={resolveApiAsset(user.avatarUrl)}
            alt={displayName || "User avatar"}
            className={`rounded-full object-cover ${variant === "icon" ? "h-10 w-10" : "h-8 w-8"}`}
          />
        ) : (
          <span
            className={`flex items-center justify-center rounded-full ${
              variant === "icon" ? "h-10 w-10 border border-slate-200 bg-white text-sm" : "h-8 w-8 bg-slate-100 text-xs"
            } font-bold text-slate-700`}
          >
            {initials}
          </span>
        )}
        {!compact && variant !== "icon" && (
          <span className="max-w-[140px] truncate text-[11px] font-semibold text-slate-700">
            {displayName || tx("Account", "Tai khoan")}
          </span>
        )}
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg"
        >
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-slate-900">
              {displayName || tx("Account", "Tai khoan")}
            </p>
            {user?.email && <p className="text-[11px] text-slate-500">{user.email}</p>}
          </div>
          <div className="my-2 h-px bg-slate-100" />
          <div className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
            <Link
              href="/account"
              className="rounded-xl px-3 py-2 hover:bg-slate-100"
              onClick={() => setMenuOpen(false)}
            >
              {tx("Account settings", "Tai khoan")}
            </Link>
            <Link
              href="/support"
              className="rounded-xl px-3 py-2 hover:bg-slate-100"
              onClick={() => setMenuOpen(false)}
            >
              {tx("Support", "Ho tro")}
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl px-3 py-2 hover:bg-slate-100"
              onClick={() => setMenuOpen(false)}
            >
              {tx("My Learning", "Hoc tap")}
            </Link>
            <Link
              href="/studio"
              className="rounded-xl px-3 py-2 hover:bg-slate-100"
              onClick={() => setMenuOpen(false)}
            >
              Studio
            </Link>
            {user?.isAdmin && (
              <Link
                href="/admin"
                className="rounded-xl px-3 py-2 hover:bg-slate-100"
                onClick={() => setMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            <Link
              href="/wishlist"
              className="rounded-xl px-3 py-2 hover:bg-slate-100"
              onClick={() => setMenuOpen(false)}
            >
              {tx("Wishlist", "Yeu thich")}
            </Link>
            <Link
              href="/cart"
              className="rounded-xl px-3 py-2 hover:bg-slate-100"
              onClick={() => setMenuOpen(false)}
            >
              {tx("Cart", "Gio hang")}
            </Link>
          </div>
          <div className="my-2 h-px bg-slate-100" />
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            {tx("Sign out", "Dang xuat")}
          </button>
        </div>
      )}
    </div>
  );
}
