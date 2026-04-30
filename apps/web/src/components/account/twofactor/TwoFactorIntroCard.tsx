"use client";

import { AlertCircle } from "lucide-react";
import { useI18n } from "@/app/providers";

export default function TwoFactorIntroCard() {
  const { tx } = useI18n();

  return (
    <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <h3 className="mb-2 text-sm font-semibold text-blue-900">{tx("Why enable 2FA?", "Tại sao nên bật 2FA?")}</h3>
      <ul className="space-y-1 text-xs text-blue-700">
        <li>• {tx("Protect your account from unauthorized access", "Bảo vệ tài khoản khỏi truy cập trái phép")}</li>
        <li>• {tx("Add a layer of security beyond your password", "Thêm lớp bảo mật ngoài mật khẩu")}</li>
        <li>• {tx("Safer with one-time verification codes", "An toàn hơn với mã xác thực động")}</li>
      </ul>
    </div>
  );
}
