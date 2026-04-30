"use client";

import { Eye, EyeOff, Lock, Mail, User, Loader2 } from "lucide-react";
import type { AuthFormState, AuthMode } from "@/components/AuthModalBody";

type Props = {
  mode: AuthMode;
  tx: (en: string, vi: string) => string;
  loading: boolean;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  form: AuthFormState;
  setForm: React.Dispatch<React.SetStateAction<AuthFormState>>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoForgot: () => void;
};

function FieldIcon({ children }: { children: React.ReactNode }) {
  return <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{children}</span>;
}

function TextInput({
  type,
  placeholder,
  value,
  onChange,
  icon,
  rightSlot,
}: {
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <FieldIcon>{icon}</FieldIcon>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {rightSlot ? <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div> : null}
    </div>
  );
}

export default function AuthModalForm({
  mode,
  tx,
  loading,
  showPassword,
  setShowPassword,
  form,
  setForm,
  onSubmit,
  onGoForgot,
}: Props) {
  if (mode === "confirm-email") {
    return null;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode === "register" ? (
        <TextInput
          type="text"
          placeholder={tx("Họ và tên", "Họ và tên")}
          value={form.name}
          onChange={(value) => setForm((current) => ({ ...current, name: value }))}
          icon={<User className="size-4" />}
        />
      ) : null}

      <TextInput
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(value) => setForm((current) => ({ ...current, email: value }))}
        icon={<Mail className="size-4" />}
      />

      {mode === "login" || mode === "register" ? (
        <TextInput
          type={showPassword ? "text" : "password"}
          placeholder={tx("Mật khẩu", "Mật khẩu")}
          value={form.password}
          onChange={(value) => setForm((current) => ({ ...current, password: value }))}
          icon={<Lock className="size-4" />}
          rightSlot={
            <button type="button" onClick={() => setShowPassword((current) => !current)} className="text-gray-400">
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
        />
      ) : null}

      {mode === "register" ? (
        <TextInput
          type="password"
          placeholder={tx("Xác nhận mật khẩu", "Xác nhận mật khẩu")}
          value={form.confirm}
          onChange={(value) => setForm((current) => ({ ...current, confirm: value }))}
          icon={<Lock className="size-4" />}
        />
      ) : null}

      {mode === "reset" ? (
        <div className="space-y-4">
          <TextInput
            type={showPassword ? "text" : "password"}
            placeholder={tx("Mật khẩu mới", "Mật khẩu mới")}
            value={form.resetPassword}
            onChange={(value) => setForm((current) => ({ ...current, resetPassword: value }))}
            icon={<Lock className="size-4" />}
            rightSlot={
              <button type="button" onClick={() => setShowPassword((current) => !current)} className="text-gray-400">
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
          />
          <TextInput
            type="password"
            placeholder={tx("Xác nhận mật khẩu", "Xác nhận mật khẩu")}
            value={form.confirm}
            onChange={(value) => setForm((current) => ({ ...current, confirm: value }))}
            icon={<Lock className="size-4" />}
          />
        </div>
      ) : null}

      {mode === "login" ? (
        <div className="flex justify-end">
          <button type="button" onClick={onGoForgot} className="text-sm text-blue-600 hover:underline">
            {tx("Quên mật khẩu?", "Quên mật khẩu?")}
          </button>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white transition-all hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : null}
        {mode === "login"
          ? tx("Đăng nhập", "Đăng nhập")
          : mode === "register"
            ? tx("Tạo tài khoản", "Tạo tài khoản")
            : mode === "forgot"
              ? tx("Gửi mã OTP", "Gửi mã OTP")
              : tx("Đặt lại mật khẩu", "Đặt lại mật khẩu")}
      </button>
    </form>
  );
}
