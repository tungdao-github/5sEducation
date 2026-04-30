"use client";

import Link from "next/link";
import { BookOpen, Video } from "lucide-react";
import { SearchSuggestInput } from "@/components/SearchSuggestInput";
import { HeaderAuth } from "@/components/HeaderAuth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useHeaderAccount } from "@/components/useHeaderAccount";
import { SITE_HEADER_MAIN_LINKS } from "@/components/siteHeaderNav";

type HeaderAccountState = ReturnType<typeof useHeaderAccount>;

type Props = {
  tx: (en: string, vi: string) => string;
  account: HeaderAccountState;
  onToggleMenu: () => void;
  menuOpen: boolean;
};

export default function SiteHeaderDesktopNav({ tx, account, onToggleMenu, menuOpen }: Props) {
  return (
    <div className="border-b border-slate-200">
      <div className="container mx-auto max-w-7xl">
        <div className="flex h-16 items-center gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80">
            <BookOpen className="size-7 text-blue-600" />
            <span className="text-lg font-bold text-slate-900">EduCourse</span>
          </Link>

          <div className="hidden flex-1 justify-center md:flex">
            <form action="/courses" method="get" className="flex w-full max-w-2xl">
              <SearchSuggestInput
                name="q"
                placeholder={tx("Search courses...", "Tìm kiếm khóa học...")}
                className="w-full"
                inputClassName="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </form>
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            {SITE_HEADER_MAIN_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hidden px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-blue-600 lg:block"
              >
                {tx(item.label === "Home" ? "Home" : item.label === "My Learning" ? "My Learning" : item.label, item.label === "Home" ? "Trang chủ" : item.label === "My Learning" ? "Khóa học của tôi" : item.label)}
              </Link>
            ))}
            {account.isInstructor ? (
              <Link href="/instructor" className="hidden items-center gap-1 px-3 py-2 text-sm font-medium text-green-600 transition-colors hover:text-green-700 lg:flex">
                <Video className="size-4" />
                {tx("Instructor", "Giảng viên")}
              </Link>
            ) : null}
            <div className="flex items-center gap-2">
              <LanguageSwitcher variant="icon" compact />
            </div>
            <HeaderAuth account={account} />
            <button
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
              onClick={onToggleMenu}
              aria-label={tx("Toggle menu", "Mở menu")}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
