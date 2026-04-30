"use client";

import { User } from "lucide-react";
import { useI18n } from "@/app/providers";

type Props = {
  onLogin: () => void;
};

export default function AccountGuestPrompt({ onLogin }: Props) {
  const { tx } = useI18n();

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-gray-50">
      <div className="max-w-sm px-4 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-blue-100">
          <User className="size-8 text-blue-600" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-gray-900">{tx("You are not signed in", "Bạn chưa đăng nhập")}</h2>
        <p className="mb-5 text-sm text-gray-500">{tx("Please sign in to view your account.", "Vui lòng đăng nhập để xem tài khoản của bạn.")}</p>
        <button onClick={onLogin} className="rounded-xl bg-blue-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700">
          {tx("Sign in now", "Đăng nhập ngay")}
        </button>
      </div>
    </div>
  );
}
