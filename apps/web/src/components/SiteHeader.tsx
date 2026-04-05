"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HeaderAuth } from "@/components/HeaderAuth";
import { CompareNavLink } from "@/components/CompareNavLink";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SearchSuggestInput } from "@/components/SearchSuggestInput";
import { useI18n } from "@/app/providers";
import { API_URL, resolveApiAsset } from "@/lib/api";

export function SiteHeader() {
  const { tx } = useI18n();
  const [siteName, setSiteName] = useState("Edu 5S");
  const [logoUrl, setLogoUrl] = useState("");
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
        setSiteName(map.get("siteName") || "Edu 5S");
        setLogoUrl(map.get("logoUrl") || "");
      } catch {
        // ignore
      }
    };

    load();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--stroke)] bg-white/95 backdrop-blur">
      <div className="section-shell">
        <div className="grid items-center gap-6 py-4 lg:grid-cols-[240px_1fr_auto]">
          <div className="hidden lg:flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-[color:var(--ink)]">
              {resolvedLogoUrl ? (
                <img
                  src={resolvedLogoUrl}
                  alt={siteName}
                  className="h-8 w-auto"
                />
              ) : (
                siteName
              )}
            </Link>
          </div>

          <div className="hidden items-center gap-6 lg:flex">
            <form
              action="/courses"
              method="get"
              className="flex w-full max-w-xl items-center gap-3 rounded-full border border-[color:var(--stroke)] bg-white px-5 py-2 shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-slate-400" fill="none" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
              </svg>
              <SearchSuggestInput
                name="q"
                placeholder={tx("Search courses ...", "Tim kiem khoa hoc ...")}
                inputClassName="w-full bg-transparent text-sm text-[color:var(--ink)] placeholder:text-slate-500 focus:outline-none"
                className="flex-1"
              />
            </form>

            <nav className="flex items-center gap-6 text-sm font-semibold text-[color:var(--muted)]">
              <Link href="/paths" className="hover:text-emerald-700">
                {tx("School", "Truong Hoc")}
              </Link>
              <Link href="/courses" className="hover:text-emerald-700">
                {tx("Instructor", "Giang vien")}
              </Link>
              <Link href="/dashboard" className="hover:text-emerald-700">
                {tx("My learning", "Viec hoc cua toi")}
              </Link>
            </nav>
          </div>

          <div className="hidden items-center gap-6 lg:flex">
            <LanguageSwitcher variant="icon" />
            <div className="flex flex-col items-center gap-1 text-[10px] font-semibold text-[color:var(--muted)]">
              <span>{tx("Notifications", "Thong bao")}</span>
              <button
                type="button"
                aria-label={tx("Notifications", "Thong bao")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--stroke)] bg-white text-slate-600 hover:border-[color:var(--stroke)] hover:text-emerald-700"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path
                    d="M15.5 17h-7a3 3 0 0 0 3.5 2 3 3 0 0 0 3.5-2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M18 17H6l1.5-2.2a6 6 0 0 0 .9-3.2V9.5a3.6 3.6 0 1 1 7.2 0v2.1c0 1.1.3 2.2.9 3.2L18 17z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <HeaderAuth variant="icon" />
          </div>
        </div>

        <div className="hidden lg:grid grid-cols-[240px_1fr_auto] pb-4">
          <div />
          <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-[color:var(--muted)]">
            <span>{tx("For students", "Danh cho Hoc sinh")}</span>
            <span>{tx("For individuals", "Danh cho Ca nhan")}</span>
            <span>{tx("For businesses", "Danh cho Doanh nghiep")}</span>
            <span>{tx("For government", "Danh cho Chinh phu")}</span>
          </div>
          <div />
        </div>
      </div>

      <div className="section-shell lg:hidden pb-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-[color:var(--ink)]">
            {resolvedLogoUrl ? (
              <img
                src={resolvedLogoUrl}
                alt={siteName}
                className="h-7 w-auto"
              />
            ) : (
              siteName
            )}
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher compact />
            <HeaderAuth compact />
          </div>
        </div>

        <form
          action="/courses"
          method="get"
          className="mt-4 flex items-center gap-3 rounded-full border border-[color:var(--stroke)] bg-white px-4 py-2"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-slate-400" fill="none" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
          </svg>
          <SearchSuggestInput
            name="q"
            placeholder={tx("Search courses ...", "Tim kiem khoa hoc ...")}
            inputClassName="w-full bg-transparent text-sm text-[color:var(--ink)] placeholder:text-slate-500 focus:outline-none"
            className="flex-1"
          />
        </form>

        <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-[color:var(--muted)]">
          <Link href="/paths">{tx("School", "Truong Hoc")}</Link>
          <Link href="/courses">{tx("Instructor", "Giang vien")}</Link>
          <Link href="/dashboard">{tx("My learning", "Viec hoc cua toi")}</Link>
        </div>

        <div className="mt-3 flex flex-wrap gap-3 text-[11px] font-semibold text-[color:var(--muted)]">
          <span>{tx("For students", "Danh cho Hoc sinh")}</span>
          <span>{tx("For individuals", "Danh cho Ca nhan")}</span>
          <span>{tx("For businesses", "Danh cho Doanh nghiep")}</span>
          <span>{tx("For government", "Danh cho Chinh phu")}</span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-[color:var(--muted)]">
          <Link href="/courses">{tx("Courses", "Khoa hoc")}</Link>
          <Link href="/paths">{tx("Paths", "Lo trinh")}</Link>
          <Link href="/blog">{tx("Blog", "Tin tuc")}</Link>
          <CompareNavLink compact />
          <Link href="/dashboard">{tx("My learning", "Viec hoc cua toi")}</Link>
        </div>
      </div>
    </header>
  );
}

