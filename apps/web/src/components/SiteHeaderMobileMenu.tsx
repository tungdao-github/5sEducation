"use client";

import Link from "next/link";
import { SearchSuggestInput } from "@/components/SearchSuggestInput";
import { useHeaderAccount } from "@/components/useHeaderAccount";

type HeaderAccountState = ReturnType<typeof useHeaderAccount>;

type Props = {
  tx: (en: string, vi: string) => string;
  account: HeaderAccountState;
  onClose: () => void;
};

export default function SiteHeaderMobileMenu({ tx, account, onClose }: Props) {
  return (
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
          <Link href="/" onClick={onClose} className="block rounded-xl px-3 py-2 text-slate-700 transition-colors hover:bg-slate-100">
            Trang chủ
          </Link>
          <Link href="/my-learning" onClick={onClose} className="block rounded-xl px-3 py-2 text-slate-700 transition-colors hover:bg-slate-100">
            Khóa học của tôi
          </Link>
          <Link href="/docs" onClick={onClose} className="block rounded-xl px-3 py-2 text-slate-700 transition-colors hover:bg-slate-100">
            Tài liệu
          </Link>
          <Link href="/compare" onClick={onClose} className="block rounded-xl px-3 py-2 text-slate-700 transition-colors hover:bg-slate-100">
            So sánh khóa học
          </Link>
          <hr className="my-2 border-slate-200" />
          {account.isInstructor ? (
            <Link href="/instructor" onClick={onClose} className="block rounded-xl px-3 py-2 text-green-600 transition-colors hover:bg-green-50">
              Dashboard Giảng viên
            </Link>
          ) : account.user?.instructorStatus === "pending" ? (
            <Link href="/become-instructor" onClick={onClose} className="block rounded-xl px-3 py-2 text-orange-600 transition-colors hover:bg-orange-50">
              Đơn đang chờ duyệt
            </Link>
          ) : (
            <Link href="/become-instructor" onClick={onClose} className="block rounded-xl px-3 py-2 text-purple-600 transition-colors hover:bg-purple-50">
              Trở thành Giảng viên
            </Link>
          )}

          {!account.isAuthed ? (
            <>
              <hr className="my-2 border-slate-200" />
              <div className="flex gap-2">
                <Link href="/?auth=login" onClick={onClose} className="flex-1 rounded-lg border border-blue-600 px-4 py-2 text-center text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50">
                  Đăng nhập
                </Link>
                <Link href="/?auth=register" onClick={onClose} className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700">
                  Đăng ký
                </Link>
              </div>
            </>
          ) : null}
        </nav>
      </div>
    </div>
  );
}
