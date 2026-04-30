"use client";

import { LogOut, Star } from "lucide-react";
import { useI18n } from "@/app/providers";
import { translateMembershipLevel } from "@/components/account/accountLoyaltyUtils";

type Props = {
  name: string;
  email: string;
  level: string;
  points: number;
  levelClassName: { bg: string; text: string; border: string };
  onLogout: () => void;
};

export default function AccountHeader({ name, email, level, points, levelClassName, onLogout }: Props) {
  const { tx, locale } = useI18n();

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
      <div className="flex items-center gap-5">
        <div className="flex size-16 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-3xl font-bold">{name.charAt(0).toUpperCase()}</div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold">{name}</h1>
          <p className="truncate text-sm text-blue-100">{email}</p>
          <div className="mt-2 flex items-center gap-3">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${levelClassName.bg} ${levelClassName.text} ${levelClassName.border}`}>
              ⭐ {translateMembershipLevel(level, tx, locale)}
            </span>
            <span className="flex items-center gap-1 text-xs text-blue-200">
              <Star className="size-3 fill-yellow-300 text-yellow-300" />
              {points.toLocaleString()} {tx("reward points", "điểm thưởng")}
            </span>
          </div>
        </div>
        <button onClick={onLogout} className="hidden items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/30 sm:flex">
          <LogOut className="size-4" />
          {tx("Sign out", "Đăng xuất")}
        </button>
      </div>
    </div>
  );
}
