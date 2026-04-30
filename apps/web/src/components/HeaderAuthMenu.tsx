"use client";

import Link from "next/link";
import { resolveApiAsset } from "@/lib/api";
import type { HeaderUserProfile } from "@/components/useHeaderAccount";

type Props = {
  displayName: string;
  initials: string;
  user: HeaderUserProfile | null;
  isInstructor: boolean;
  onClose: () => void;
  onSignOut: () => void;
};

export default function HeaderAuthMenu({ displayName, initials, user, isInstructor, onClose, onSignOut }: Props) {
  return (
    <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
      <div className="border-b border-gray-100 px-4 py-3">
        <p className="font-semibold text-gray-900">{displayName || "Tài khoản"}</p>
        {user?.email ? <p className="truncate text-xs text-gray-500">{user.email}</p> : null}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs font-semibold text-sky-400">⭐ {user?.loyaltyTier || "Bronze"}</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs font-medium text-blue-600">{user?.loyaltyPoints ?? 0} điểm</span>
        </div>
      </div>
      <div className="px-1 py-1">
        <Link href="/my-learning" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600" onClick={onClose}>
          Khóa học của tôi
        </Link>
        <Link href="/account" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600" onClick={onClose}>
          Tài khoản
        </Link>
        <Link href="/wishlist" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600" onClick={onClose}>
          Yêu thích
        </Link>
        <Link href="/cart" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600" onClick={onClose}>
          Giỏ hàng
        </Link>
      </div>
      <div className="my-2 border-t border-gray-100" />
      <div className="px-1 py-1">
        {isInstructor ? (
          <Link href="/instructor" className="flex items-center gap-3 px-3 py-2.5 text-sm text-green-600 transition-colors hover:bg-green-50" onClick={onClose}>
            Dashboard Giảng viên
          </Link>
        ) : (
          <Link href="/become-instructor" className="flex items-center gap-3 px-3 py-2.5 text-sm text-purple-600 transition-colors hover:bg-purple-50" onClick={onClose}>
            Trở thành Giảng viên
          </Link>
        )}
        {user?.isAdmin ? (
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 text-sm text-purple-600 transition-colors hover:bg-purple-50" onClick={onClose}>
            Quản trị Admin
          </Link>
        ) : null}
      </div>
      <div className="my-2 border-t border-gray-100" />
      <button type="button" onClick={onSignOut} className="w-full px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50">
        Đăng xuất
      </button>
    </div>
  );
}
