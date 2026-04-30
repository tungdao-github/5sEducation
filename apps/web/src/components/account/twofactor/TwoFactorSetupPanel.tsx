"use client";

import { AlertCircle, Check, Copy } from "lucide-react";
import { useI18n } from "@/app/providers";

type Props = {
  secret: string;
  copied: boolean;
  verifyCode: string;
  setVerifyCode: (value: string) => void;
  onCopySecret: () => void;
  onCancel: () => void;
  onVerify: () => void;
};

export default function TwoFactorSetupPanel({ secret, copied, verifyCode, setVerifyCode, onCopySecret, onCancel, onVerify }: Props) {
  const { tx } = useI18n();

  return (
    <div className="max-w-md">
      <div className="mb-4 rounded-xl border border-gray-200 p-5">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">{tx("Step 1: Scan QR code", "Bước 1: Quét mã QR")}</h3>
        <div className="mb-3 flex items-center justify-center rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-center">
            <div className="mx-auto mb-2 flex size-48 items-center justify-center rounded-lg bg-gray-100">
              <div className="px-4 text-center text-xs text-gray-400">
                QR Code
                <br />
                <span className="text-[10px]">otpauth://totp/EduCourse:...</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">{tx("Scan this code with an app like Google Authenticator or Authy", "Quét mã này bằng ứng dụng như Google Authenticator, Authy")}</p>
          </div>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="mb-2 text-xs font-medium text-gray-600">{tx("Or enter the code manually:", "Hoặc nhập mã thủ công:")}</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded border border-gray-200 bg-white px-3 py-2 font-mono text-xs">{secret}</code>
            <button onClick={onCopySecret} className="rounded-lg p-2 transition-colors hover:bg-gray-100" title={tx("Copy", "Sao chép")}>
              {copied ? <Check className="size-4 text-green-600" /> : <Copy className="size-4 text-gray-600" />}
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-gray-200 p-5">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">{tx("Step 2: Verify code", "Bước 2: Xác thực mã")}</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder={tx("Enter 6-digit code", "Nhập mã 6 chữ số")}
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-center font-mono text-xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={6}
          />
          <p className="text-center text-xs text-gray-500">{tx("Demo code: 123456", "Demo code: 123456")}</p>
          <div className="flex gap-2">
            <button onClick={onCancel} className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
              {tx("Cancel", "Hủy")}
            </button>
            <button onClick={onVerify} disabled={verifyCode.length !== 6} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60">
              {tx("Verify", "Xác nhận")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
