import { Award, Heart, Lock, MapPin, ShoppingBag, User } from "lucide-react";
import type { ReactNode } from "react";
import type { AccountTabId } from "@/components/account/AccountSidebar";

export const ACCOUNT_LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Bronze: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Silver: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" },
  Gold: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  Platinum: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
};

export type AccountTabItem = {
  id: AccountTabId;
  label: string;
  icon: ReactNode;
  badge?: number;
};

type Translate = (en: string, vi: string, es?: string, fr?: string) => string;

export function buildAccountTabs(wishlistCount: number, tx: Translate): AccountTabItem[] {
  return [
    { id: "profile", label: tx("Profile", "Hồ sơ cá nhân"), icon: <User className="size-4" /> },
    { id: "orders", label: tx("Orders", "Đơn hàng"), icon: <ShoppingBag className="size-4" /> },
    { id: "wishlist", label: tx("Wishlist", "Yêu thích"), icon: <Heart className="size-4" />, badge: wishlistCount },
    { id: "addresses", label: tx("Addresses", "Địa chỉ"), icon: <MapPin className="size-4" /> },
    { id: "loyalty", label: tx("Rewards", "Điểm thưởng"), icon: <Award className="size-4" /> },
    { id: "password", label: tx("Password", "Đổi mật khẩu"), icon: <Lock className="size-4" /> },
  ];
}
