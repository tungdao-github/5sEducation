"use client";

import { CheckCircle } from "lucide-react";
import { useI18n } from "@/app/providers";

type Props = {
  disableCode: string;
  setDisableCode: (value: string) => void;
  onDisable: () => void;
  isDisabling: boolean;
};

export default function TwoFactorEnabledPanel({ disableCode, setDisableCode, onDisable, isDisabling }: Props) {
  const { tx } = useI18n();

  return (
    <div className="max-w-sm">
      <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="mt-0.5 size-5 flex-shrink-0 text-green-600" />
          <div>
            <h3 className="mb-1 text-sm font-semibold text-green-900">{tx("2FA is enabled", "2FA đã được kích hoạt")}</h3>
            <p className="text-xs text-green-700">{tx("Your account is protected by two-factor authentication", "Tài khoản của bạn được bảo vệ bởi xác thực hai yếu tố")}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">{tx("Enter the verification code to disable 2FA", "Nhập mã xác thực để tắt 2FA")}</label>
          <input
            type="text"
            placeholder={tx("6-digit code", "Mã 6 chữ số")}
            value={disableCode}
            onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-center font-mono text-xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={6}
          />
          <p className="mt-2 text-center text-xs text-gray-500">{tx("Demo code: 123456", "Demo code: 123456")}</p>
        </div>
        <button onClick={onDisable} disabled={isDisabling || disableCode.length !== 6} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60">
          {isDisabling ? <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : null}
          {tx("Disable two-factor authentication", "Tắt xác thực hai yếu tố")}
        </button>
      </div>
    </div>
  );
}
