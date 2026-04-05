"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HeaderAuth } from "@/components/HeaderAuth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SearchSuggestInput } from "@/components/SearchSuggestInput";
import { useI18n } from "@/app/providers";
import { API_URL, resolveApiAsset } from "@/lib/api";

export function SiteHeader() {
  const { tx } = useI18n();
  const [siteName, setSiteName] = useState("EduCourse");
  const [logoUrl, setLogoUrl] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const resolvedLogoUrl =
    logoUrl && (logoUrl.startsWith("http") || logoUrl.startsWith("/"))
      ? logoUrl
      : logoUrl
        ? resolveApiAsset(logoUrl)
        : "";

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/settings?keys=siteName,logoUrl`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const data = (await res.json()) as { key: string; value: string }[];
        const map = new Map(data.map((item) => [item.key, item.value]));
        setSiteName(map.get("siteName") || "EduCourse");
        setLogoUrl(map.get("logoUrl") || "");
      } catch {
        // ignore
      }
    };

    load();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-gray-900 hover:opacity-80 transition-opacity">
            {resolvedLogoUrl ? (
              <img src={resolvedLogoUrl} alt={siteName} className="h-8 w-auto" />
            ) : (
              <span className="text-xl">{siteName}</span>
            )}
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <Link href="/courses" className="hover:text-blue-600 transition-colors">
              {tx("Courses", "Khoa hoc")}
            </Link>
            <Link href="/blog" className="hover:text-blue-600 transition-colors">
              {tx("Blog", "Blog")}
            </Link>
            <Link href="/support" className="hover:text-blue-600 transition-colors">
              {tx("About", "Gioi thieu")}
            </Link>
          </nav>

          <div className="hidden lg:flex flex-1 justify-center px-6">
            <form
              action="/courses"
              method="get"
              className="flex w-full max-w-md items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-2 shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-gray-400" fill="none" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
              </svg>
              <SearchSuggestInput
                name="q"
                placeholder={tx("Search courses...", "Tim khoa hoc...")}
                inputClassName="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none"
                className="flex-1"
              />
            </form>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {searchOpen ? (
              <form
                action="/courses"
                method="get"
                className="flex items-center gap-2 lg:hidden"
              >
                <SearchSuggestInput
                  name="q"
                  placeholder={tx("Search...", "Tim kiem...")}
                  inputClassName="w-40 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-gray-500 hover:text-gray-800 p-1"
                  aria-label={tx("Close search", "Dong tim kiem")}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 6l12 12" strokeLinecap="round" />
                    <path d="M18 6l-12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors lg:hidden"
                title={tx("Search", "Tim kiem")}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                </svg>
              </button>
            )}

            <LanguageSwitcher variant="icon" compact />

            <Link
              href="/wishlist"
              className="relative p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title={tx("Wishlist", "Yeu thich")}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20s-6-4.4-8.2-8.3a4.5 4.5 0 0 1 7.7-4.7L12 7.6l.5-.6a4.5 4.5 0 0 1 7.7 4.7C18 15.6 12 20 12 20z" />
              </svg>
            </Link>

            <Link
              href="/cart"
              className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title={tx("Cart", "Gio hang")}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="20" r="1.5" />
                <circle cx="17" cy="20" r="1.5" />
                <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.5L21 8H7" />
              </svg>
            </Link>

            <div className="hidden sm:flex items-center gap-2">
              <HeaderAuth />
            </div>

            <button
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={tx("Toggle menu", "Mo menu")}
            >
              {menuOpen ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12" strokeLinecap="round" />
                  <path d="M18 6l-12 12" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16" strokeLinecap="round" />
                  <path d="M4 12h16" strokeLinecap="round" />
                  <path d="M4 18h16" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200 space-y-1">
            <Link
              href="/courses"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
            >
              {tx("Courses", "Khoa hoc")}
            </Link>
            <Link
              href="/blog"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
            >
              {tx("Blog", "Blog")}
            </Link>
            <Link
              href="/support"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
            >
              {tx("About", "Gioi thieu")}
            </Link>
            <hr className="border-gray-200 my-2" />
            <div className="flex gap-2 px-3">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex-1 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors text-center"
              >
                {tx("Sign in", "Dang nhap")}
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors text-center"
              >
                {tx("Sign up", "Dang ky")}
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
