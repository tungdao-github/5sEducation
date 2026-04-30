"use client";

import type { AuthMode } from "@/components/AuthModalBody";

type Props = {
  mode: AuthMode;
  tx: (en: string, vi: string) => string;
  onGoLogin: () => void;
  onGoRegister: () => void;
};

export default function AuthModalFooter({ mode, tx, onGoLogin, onGoRegister }: Props) {
  return (
    <div className="mt-4 text-center text-sm text-gray-600">
      {mode === "login" ? (
        <>
          {tx("Chưa có tài khoản?", "Chưa có tài khoản?")}{" "}
          <button type="button" onClick={onGoRegister} className="font-semibold text-blue-600 hover:underline">
            {tx("Đăng ký ngay", "Đăng ký ngay")}
          </button>
        </>
      ) : mode === "register" ? (
        <>
          {tx("Đã có tài khoản?", "Đã có tài khoản?")}{" "}
          <button type="button" onClick={onGoLogin} className="font-semibold text-blue-600 hover:underline">
            {tx("Đăng nhập", "Đăng nhập")}
          </button>
        </>
      ) : mode === "forgot" || mode === "reset" ? (
        <button type="button" onClick={onGoLogin} className="font-semibold text-blue-600 hover:underline">
          {tx("← Quay lại đăng nhập", "← Quay lại đăng nhập")}
        </button>
      ) : null}
    </div>
  );
}
