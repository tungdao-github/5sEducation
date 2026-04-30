"use client";

import { Lock, Shield, User, X } from "lucide-react";
import type { AuthMode } from "@/components/AuthModalBody";

type Props = {
  mode: AuthMode;
  tx: (en: string, vi: string) => string;
  onClose: () => void;
};

export default function AuthModalHeader({ mode, tx, onClose }: Props) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center text-white">
      <button type="button" onClick={onClose} className="absolute right-4 top-4 text-white/80 transition-colors hover:text-white">
        <X className="size-5" />
      </button>
      <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-white/20">
        {mode === "login" || mode === "register" ? (
          <User className="size-8" />
        ) : mode === "forgot" || mode === "reset" ? (
          <Lock className="size-8" />
        ) : (
          <Shield className="size-8" />
        )}
      </div>
      <h2 className="text-2xl font-bold">
        {mode === "login"
          ? tx("Đăng nhập", "Đăng nhập")
          : mode === "register"
            ? tx("Tạo tài khoản", "Tạo tài khoản")
            : mode === "forgot"
              ? tx("Quên mật khẩu", "Quên mật khẩu")
              : mode === "reset"
                ? tx("Đặt lại mật khẩu", "Đặt lại mật khẩu")
                : tx("Xác thực email", "Xác thực email")}
      </h2>
      <p className="mt-1 text-sm text-blue-100">
        {mode === "login"
          ? tx("Chào mừng bạn trở lại EduCourse", "Chào mừng bạn trở lại EduCourse")
          : mode === "register"
            ? tx("Tham gia cộng đồng học tập", "Tham gia cộng đồng học tập")
            : mode === "forgot"
              ? tx("Đặt lại mật khẩu của bạn", "Đặt lại mật khẩu của bạn")
              : mode === "reset"
                ? tx("Tạo mật khẩu mới cho tài khoản của bạn", "Tạo mật khẩu mới cho tài khoản của bạn")
                : tx("Vui lòng xác thực email để kích hoạt tài khoản", "Vui lòng xác thực email để kích hoạt tài khoản")}
      </p>
    </div>
  );
}
