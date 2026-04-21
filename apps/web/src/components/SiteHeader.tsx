"use client";

import Link from "next/link";
import { useState } from "react";
import { HeaderAuth } from "@/components/HeaderAuth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SearchSuggestInput } from "@/components/SearchSuggestInput";
import { useHeaderAccount } from "@/components/useHeaderAccount";
import { useI18n } from "@/app/providers";
import {
  Bell,
  BookOpen,
  Briefcase,
  Landmark,
  Menu,
  TrendingUp,
  User,
  Users2,
  Video,
  X,
} from "lucide-react";

export function SiteHeader() {
  const { tx } = useI18n();
  const account = useHeaderAccount();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
              <Link href="/" className="hidden lg:block px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-blue-600">
                {tx("Home", "Trang chủ")}
              </Link>
              {account.isInstructor && (
                <Link href="/instructor" className="hidden lg:flex items-center gap-1 px-3 py-2 text-sm font-medium text-green-600 transition-colors hover:text-green-700">
                  <Video className="size-4" />
                  {tx("Intruduction", "Giảng viên")}
                </Link>
              )}
              <Link href="/my-learning" className="hidden lg:block px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-blue-600">
                {tx("My Learning", "Khóa học của tôi")}
              </Link>

              <LanguageSwitcher variant="icon" compact />

              <button
                type="button"
                className="relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
                title={tx("Notifications", "Thông báo")}
              >
                <Bell className="size-5" />
                <span className="absolute right-1 top-1 size-2 rounded-full bg-red-500" />
              </button>

              <HeaderAuth account={account} />

              <button
                className="lg:hidden rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label={tx("Toggle menu", "Mở menu")}
              >
                {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden border-b border-slate-200 lg:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex h-14 items-center gap-6 text-sm font-medium text-slate-700">
            <Link href="/?category=students" className="flex items-center gap-2 transition-colors hover:text-blue-600">
              <Users2 className="size-4" />
              Dành cho Học sinh
            </Link>
            <Link href="/?category=personal" className="flex items-center gap-2 transition-colors hover:text-blue-600">
              <User className="size-4" />
              Dành cho Cá nhân
            </Link>
            <Link href="/?category=business" className="flex items-center gap-2 transition-colors hover:text-blue-600">
              <Briefcase className="size-4" />
              Dành cho Doanh nghiệp
            </Link>
            <Link href="/?category=government" className="flex items-center gap-2 transition-colors hover:text-blue-600">
              <Landmark className="size-4" />
              Dành cho Chính phủ
            </Link>
            <span className="flex-1" />
            {/* <Link href="/compare" className="flex items-center gap-1 transition-colors hover:text-blue-600">
              <TrendingUp className="size-4" />
              So sánh khóa học
            </Link>
            <Link href="/blog" className="transition-colors hover:text-blue-600">
              Blog
            </Link> */}
          </nav>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            <form action="/courses" method="get" className="mb-3">
              <SearchSuggestInput
                name="q"
                placeholder={tx("Search courses...", "Tìm kiếm khóa học...")}
                className="w-full"
                inputClassName="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </form>
            <nav className="space-y-1">
              <Link href="/" onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2 text-slate-700 transition-colors hover:bg-slate-100">
                Trang chủ
              </Link>
              <Link href="/my-learning" onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2 text-slate-700 transition-colors hover:bg-slate-100">
                Khóa học của tôi
              </Link>
              <Link href="/compare" onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2 text-slate-700 transition-colors hover:bg-slate-100">
                So sánh khóa học
              </Link>
              <Link href="/blog" onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2 text-slate-700 transition-colors hover:bg-slate-100">
                Blog
              </Link>

              <hr className="my-2 border-slate-200" />

              {account.isInstructor ? (
                <Link href="/instructor" onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2 text-green-600 transition-colors hover:bg-green-50">
                  Dashboard Giảng viên
                </Link>
              ) : account.user?.instructorStatus === "pending" ? (
                <Link href="/become-instructor" onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2 text-orange-600 transition-colors hover:bg-orange-50">
                  Đơn đang chờ duyệt
                </Link>
              ) : (
                <Link href="/become-instructor" onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2 text-purple-600 transition-colors hover:bg-purple-50">
                  Trở thành Giảng viên
                </Link>
              )}

              {!account.isAuthed && (
                <>
                  <hr className="my-2 border-slate-200" />
                  <div className="flex gap-2">
                    <Link href="/?auth=login" onClick={() => setMenuOpen(false)} className="flex-1 rounded-lg border border-blue-600 px-4 py-2 text-center text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50">
                      Đăng nhập
                    </Link>
                    <Link href="/?auth=register" onClick={() => setMenuOpen(false)} className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700">
                      Đăng ký
                    </Link>
                  </div>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
