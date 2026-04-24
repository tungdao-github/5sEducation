"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail, Shield, User, X } from "lucide-react";
import { API_URL, setStoredToken, setStoredUser } from "@/lib/api";
import { useI18n } from "@/app/providers";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { FacebookSignInButton } from "@/components/FacebookSignInButton";

type AuthMode = "login" | "register" | "forgot" | "reset" | "confirm-email";

type AuthResponse = {
  token?: string;
  Token?: string;
  user?: {
    isAdmin?: boolean;
    IsAdmin?: boolean;
    roles?: string[];
    Roles?: string[];
    avatarUrl?: string | null;
    AvatarUrl?: string | null;
    email?: string;
    Email?: string;
    firstName?: string;
    FirstName?: string;
    lastName?: string;
    LastName?: string;
  };
  User?: AuthResponse["user"];
  message?: string;
  confirmLink?: string;
  resetLink?: string;
};

const resolveMode = (value: string | null): AuthMode | null => {
  switch (value) {
    case "login":
    case "register":
    case "forgot":
    case "reset":
    case "confirm-email":
      return value;
    default:
      return null;
  }
};

const sanitizeNextPath = (value: string | null) => {
  if (!value) return "/";
  if (!value.startsWith("/")) return "/";
  if (value.startsWith("//")) return "/";
  return value;
};

const resolveIsAdmin = (payload: AuthResponse | null | undefined) => {
  const user = payload?.user ?? payload?.User;
  if (!user) return false;
  if (typeof user.isAdmin === "boolean") return user.isAdmin;
  if (typeof user.IsAdmin === "boolean") return user.IsAdmin;
  const roles = Array.isArray(user.roles)
    ? user.roles
    : Array.isArray(user.Roles)
      ? user.Roles
      : [];
  return roles.some((role) => String(role).toLowerCase() === "admin");
};

const getDisplayMessage = (payload: unknown, fallback: string) => {
  if (typeof payload === "string" && payload.trim()) {
    return payload.trim();
  }
  if (Array.isArray(payload) && payload.length > 0) {
    return payload.map((item) => String(item)).join("\n");
  }
  if (payload && typeof payload === "object") {
    const data = payload as Record<string, unknown>;
    if (typeof data.title === "string" && data.title.trim()) return data.title.trim();
    if (typeof data.message === "string" && data.message.trim()) return data.message.trim();
    if (typeof data.detail === "string" && data.detail.trim()) return data.detail.trim();
  }
  return fallback;
};

export default function AuthModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { tx } = useI18n();
  const didConfirmEmailRef = useRef(false);

  const mode = useMemo(() => resolveMode(searchParams.get("auth")), [searchParams]);
  const nextPath = useMemo(
    () => sanitizeNextPath(searchParams.get("next")),
    [searchParams]
  );
  const emailFromQuery = searchParams.get("email") ?? "";
  const tokenFromQuery = searchParams.get("token") ?? "";
  const userIdFromQuery = searchParams.get("userId") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: emailFromQuery,
    password: "",
    confirm: "",
    resetPassword: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmLink, setConfirmLink] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      email: emailFromQuery || current.email,
    }));
  }, [emailFromQuery, mode]);

  useEffect(() => {
    didConfirmEmailRef.current = false;
    setError("");
    setSuccessMessage("");
    setConfirmLink("");
    setResetLink("");
    setNeedsConfirmation(false);
  }, [mode, pathname]);

  useEffect(() => {
    if (mode !== "confirm-email") {
      return;
    }
    if (didConfirmEmailRef.current) {
      return;
    }
    if (!userIdFromQuery || !tokenFromQuery) {
      setError(tx("Missing confirmation data.", "Thieu thong tin xac thuc."));
      return;
    }

    didConfirmEmailRef.current = true;
    let cancelled = false;

    const confirm = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/auth/confirm-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userIdFromQuery, token: tokenFromQuery }),
        });
        const data = (await res.json().catch(() => ({}))) as { message?: string; title?: string };
        if (cancelled) return;
        if (!res.ok) {
          throw new Error(
            getDisplayMessage(
              data,
              tx("Email confirmation failed.", "Xac thuc email that bai.")
            )
          );
        }
        setSuccessMessage(
          data.message ?? tx("Email confirmed.", "Da xac thuc email.")
        );
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : tx("Email confirmation failed.", "Xac thuc email that bai.")
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    confirm();

    return () => {
      cancelled = true;
    };
  }, [mode, tokenFromQuery, tx, userIdFromQuery]);

  const closeModal = () => {
    const target = nextPath && nextPath !== "/" ? nextPath : "/";
    router.replace(target);
  };

  const completeLogin = (payload: AuthResponse) => {
    const token = payload.token ?? payload.Token;
    const user = payload.user ?? payload.User;
    if (!token) {
      throw new Error(tx("Login failed: missing token.", "Dang nhap that bai: thieu token."));
    }

    setStoredToken(token);
    setStoredUser(user ?? null);
    window.dispatchEvent(new Event("auth-changed"));

    const isAdmin = resolveIsAdmin(payload);
    const target = nextPath && nextPath !== "/"
      ? nextPath
      : isAdmin
        ? "/admin"
        : "/my-learning";

    router.replace(target);
    router.refresh();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!mode) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");
    setConfirmLink("");
    setResetLink("");
    setNeedsConfirmation(false);

    try {
      if (mode === "login") {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email.trim(),
            password: form.password,
          }),
        });

        const payload = (await res.json().catch(() => ({}))) as AuthResponse;

        if (!res.ok) {
          if (res.status === 403) {
            setNeedsConfirmation(true);
          }
          throw new Error(
            getDisplayMessage(
              payload,
              tx("Invalid email or password.", "Email hoac mat khau khong dung.")
            )
          );
        }

        completeLogin(payload);
        return;
      }

      if (mode === "register") {
        const parts = form.name.trim().split(/\s+/).filter(Boolean);
        const firstName = parts[0] ?? "";
        const lastName = parts.slice(1).join(" ") || firstName;

        if (form.password.length < 8) {
          throw new Error(tx("Password must be at least 8 characters.", "Mat khau phai co it nhat 8 ky tu."));
        }

        if (form.password !== form.confirm) {
          throw new Error(tx("Passwords do not match.", "Mat khau khong khop."));
        }

        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName,
            lastName,
            email: form.email.trim(),
            password: form.password,
          }),
        });

        const payload = (await res.json().catch(() => ({}))) as AuthResponse;

        if (!res.ok) {
          throw new Error(
            getDisplayMessage(
              payload,
              tx("Registration failed. Please try again.", "Dang ky that bai. Vui long thu lai.")
            )
          );
        }

        setSuccessMessage(
          payload.message ??
            tx(
              "Account created. Please confirm your email.",
              "Tao tai khoan thanh cong. Vui long xac thuc email."
            )
        );
        if (payload.confirmLink) {
          setConfirmLink(payload.confirmLink);
        }
        return;
      }

      if (mode === "forgot") {
        const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email.trim(),
            resetUrl: `${window.location.origin}/reset-password`,
          }),
        });

        const payload = (await res.json().catch(() => ({}))) as AuthResponse;

        if (!res.ok) {
          throw new Error(
            getDisplayMessage(
              payload,
              tx("Unable to send reset link.", "Khong the gui lien ket dat lai.")
            )
          );
        }

        setSuccessMessage(
          payload.message ??
            tx(
              "If the email exists, a reset link was sent.",
              "Neu email ton tai, lien ket dat lai mat khau da duoc gui."
            )
        );
        if (payload.resetLink) {
          setResetLink(payload.resetLink);
        }
        return;
      }

      if (mode === "reset") {
        if (!emailFromQuery || !tokenFromQuery) {
          throw new Error(tx("Missing reset token.", "Thieu token dat lai."));
        }
        if (form.resetPassword.length < 6) {
          throw new Error(tx("Password is too short.", "Mat khau qua ngan."));
        }
        if (form.resetPassword !== form.confirm) {
          throw new Error(tx("Passwords do not match.", "Mat khau khong khop."));
        }

        const res = await fetch(`${API_URL}/api/auth/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: emailFromQuery,
            token: tokenFromQuery,
            newPassword: form.resetPassword,
          }),
        });

        const payload = (await res.json().catch(() => ({}))) as AuthResponse;
        if (!res.ok) {
          throw new Error(
            getDisplayMessage(
              payload,
              tx("Reset failed.", "Dat lai that bai.")
            )
          );
        }

        setSuccessMessage(
          tx("Password updated. You can log in now.", "Da doi mat khau. Co the dang nhap lai.")
        );
        return;
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : tx("Something went wrong.", "Co loi xay ra.")
      );
    } finally {
      setLoading(false);
    }
  };

  if (!mode) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center text-white">
          <button
            type="button"
            onClick={closeModal}
            className="absolute right-4 top-4 text-white/80 transition-colors hover:text-white"
          >
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
              ? tx("Đăng nhập", "Dang nhap")
              : mode === "register"
                ? tx("Tạo tài khoản", "Tao tai khoan")
                : mode === "forgot"
                  ? tx("Quên mật khẩu", "Quen mat khau")
                  : mode === "reset"
                    ? tx("Đặt lại mật khẩu", "Dat lai mat khau")
                    : tx("Xác thực email", "Xac thuc email")}
          </h2>
          <p className="mt-1 text-sm text-blue-100">
            {mode === "login"
              ? tx("Chào mừng bạn trở lại EduCourse", "Chao mung ban tro lai EduCourse")
              : mode === "register"
                ? tx("Tham gia cộng đồng học tập", "Tham gia cong dong hoc tap")
                : mode === "forgot"
                  ? tx("Đặt lại mật khẩu của bạn", "Dat lai mat khau cua ban")
                  : mode === "reset"
                    ? tx("Tạo mật khẩu mới cho tài khoản của bạn", "Tao mat khau moi cho tai khoan cua ban")
                    : tx("Vui lòng xác thực email để kích hoạt tài khoản", "Vui long xac thuc email de kich hoat tai khoan")}
          </p>
        </div>

        <div className="p-6">
          {mode === "confirm-email" ? (
            <div className="space-y-4 text-sm">
              {loading && (
                <p className="text-center text-slate-600">
                  {tx("Verifying your email...", "Dang xac thuc email...")}
                </p>
              )}
              {error && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</div>
              )}
              {successMessage && (
                <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700">
                  <p>{successMessage}</p>
                  <button
                    type="button"
                    onClick={() => router.replace(`/`)}
                    className="mt-3 inline-flex font-semibold text-emerald-900 underline"
                  >
                    {tx("Go to sign in", "Den trang dang nhap")}
                  </button>
                </div>
              )}
              {!loading && !successMessage && !error && (
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-slate-700">
                  {tx(
                    "Open the confirmation link from your email to continue.",
                    "Mo lien ket xac thuc trong email de tiep tuc."
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              {(mode === "login" || mode === "register") && (
                <>
                  <div className="space-y-3">
                    <GoogleSignInButton
                      nextPath={nextPath}
                      mode={mode === "register" ? "signup" : "signin"}
                    />
                    <FacebookSignInButton
                      nextPath={nextPath}
                      mode={mode === "register" ? "signup" : "signin"}
                    />
                  </div>
                  <div className="my-4 flex items-center gap-3">
                    <hr className="flex-1 border-gray-200" />
                    <span className="text-sm text-gray-400">Hoặc</span>
                    <hr className="flex-1 border-gray-200" />
                  </div>
                </>
              )}

              {error && (
                <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {needsConfirmation && (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <p>
                    {tx(
                      "Please confirm your email to sign in.",
                      "Vui long xac thuc email de dang nhap."
                    )}
                  </p>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <p>{successMessage}</p>
                  {confirmLink && (
                    <a
                      href={confirmLink}
                      className="mt-2 inline-flex text-xs font-semibold text-emerald-700 underline"
                    >
                      {tx("Open confirmation link (dev)", "Mo lien xac thuc (dev)")}
                    </a>
                  )}
                  {resetLink && (
                    <a
                      href={resetLink}
                      className="mt-2 inline-flex text-xs font-semibold text-emerald-700 underline"
                    >
                      {tx("Open reset link (dev)", "Mo lien dat lai (dev)")}
                    </a>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "register" && (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={tx("Họ và tên", "Ho va ten")}
                      required
                      value={form.name}
                      onChange={(e) => {
                        const value = e.currentTarget.value;
                        setForm((current) => ({ ...current, name: value }));
                      }}
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    value={form.email}
                    onChange={(e) => {
                      const value = e.currentTarget.value;
                      setForm((current) => ({ ...current, email: value }));
                    }}
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {(mode === "login" || mode === "register") && (
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={tx("Mật khẩu", "Mat khau")}
                      required
                      value={form.password}
                      onChange={(e) => {
                        const value = e.currentTarget.value;
                        setForm((current) => ({ ...current, password: value }));
                      }}
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                )}

                {mode === "register" && (
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      type="password"
                      placeholder={tx("Xác nhận mật khẩu", "Xac nhan mat khau")}
                      required
                      value={form.confirm}
                      onChange={(e) => {
                        const value = e.currentTarget.value;
                        setForm((current) => ({ ...current, confirm: value }));
                      }}
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {mode === "reset" && (
                  <div className="space-y-4">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder={tx("Mật khẩu mới", "Mat khau moi")}
                        required
                        value={form.resetPassword}
                        onChange={(e) => {
                          const value = e.currentTarget.value;
                          setForm((current) => ({ ...current, resetPassword: value }));
                        }}
                        className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <input
                        type="password"
                        placeholder={tx("Xác nhận mật khẩu", "Xac nhan mat khau")}
                        required
                        value={form.confirm}
                        onChange={(e) => {
                          const value = e.currentTarget.value;
                          setForm((current) => ({ ...current, confirm: value }));
                        }}
                        className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {mode === "login" && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => router.replace(`/?auth=forgot&next=${encodeURIComponent(nextPath)}`)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {tx("Quên mật khẩu?", "Quen mat khau?")}
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white transition-all hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60"
                >
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  {mode === "login"
                    ? tx("Đăng nhập", "Dang nhap")
                    : mode === "register"
                      ? tx("Tạo tài khoản", "Tao tai khoan")
                      : mode === "forgot"
                        ? tx("Gửi mã OTP", "Gui ma OTP")
                        : tx("Đặt lại mật khẩu", "Dat lai mat khau")}
                </button>
              </form>

              <div className="mt-4 text-center text-sm text-gray-600">
                {mode === "login" ? (
                  <>
                    {tx("Chưa có tài khoản?", "Chua co tai khoan?")}{" "}
                    <button
                      type="button"
                      onClick={() => router.replace(`/?auth=register&next=${encodeURIComponent(nextPath)}`)}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      {tx("Đăng ký ngay", "Dang ky ngay")}
                    </button>
                  </>
                ) : mode === "register" ? (
                  <>
                    {tx("Đã có tài khoản?", "Da co tai khoan?")}{" "}
                    <button
                      type="button"
                      onClick={() => router.replace(`/?auth=login&next=${encodeURIComponent(nextPath)}`)}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      {tx("Đăng nhập", "Dang nhap")}
                    </button>
                  </>
                ) : mode === "forgot" || mode === "reset" ? (
                  <button
                    type="button"
                    onClick={() => router.replace(`/?auth=login&next=${encodeURIComponent(nextPath)}`)}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    {tx("← Quay lại đăng nhập", "← Quay lai dang nhap")}
                  </button>
                ) : null}
              </div>

              {mode === "login" && (
                <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
                  <strong>Demo:</strong> user@test.com / 123456 (hoặc admin@educourse.vn / admin123)
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
