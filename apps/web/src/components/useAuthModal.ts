"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { confirmEmail, forgotPassword, login, register, resetPassword } from "@/services/api";
import { setStoredToken, setStoredUser } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/app/providers";
import type { AuthFormState, AuthMode } from "@/components/AuthModalBody";
import { AuthResponse, buildAuthUrl, resolveIsAdmin, resolveMode, sanitizeNextPath } from "@/components/authModalUtils";

export function useAuthModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showAuthModal, authMode, closeAuthModal } = useAuth();
  const { tx } = useI18n();
  const didConfirmEmailRef = useRef(false);

  const queryMode = useMemo(() => resolveMode(searchParams.get("auth")), [searchParams]);
  const mode = queryMode ?? (showAuthModal ? authMode : null);
  const nextPath = useMemo(() => sanitizeNextPath(searchParams.get("next")), [searchParams]);
  const emailFromQuery = searchParams.get("email") ?? "";
  const tokenFromQuery = searchParams.get("token") ?? "";
  const userIdFromQuery = searchParams.get("userId") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<AuthFormState>({
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
  const isOpen = Boolean(mode);

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
    if (mode !== "confirm-email") return;
    if (didConfirmEmailRef.current) return;
    if (!userIdFromQuery || !tokenFromQuery) {
      setError(tx("Missing confirmation data.", "Thiếu thông tin xác thực."));
      return;
    }

    didConfirmEmailRef.current = true;
    let cancelled = false;

    const confirm = async () => {
      setLoading(true);
      try {
        const data = await confirmEmail(userIdFromQuery, tokenFromQuery);
        if (!cancelled) {
          setSuccessMessage(data.message ?? tx("Email confirmed.", "Đã xác thực email."));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : tx("Email confirmation failed.", "Xác thực email thất bại."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void confirm();
    return () => {
      cancelled = true;
    };
  }, [mode, tokenFromQuery, tx, userIdFromQuery]);

  const closeModal = () => {
    if (showAuthModal) {
      closeAuthModal();
    }

    if (!queryMode) return;
    const target = nextPath && nextPath !== "/" ? nextPath : "/";
    router.replace(target);
  };

  const goToLogin = () => router.replace(buildAuthUrl("login", nextPath));
  const goToRegister = () => router.replace(buildAuthUrl("register", nextPath));
  const goToForgot = () => router.replace(buildAuthUrl("forgot", nextPath));

  const completeLogin = (payload: AuthResponse) => {
    const token = payload.token ?? payload.Token;
    const user = payload.user ?? payload.User;
    if (!token) {
      throw new Error(tx("Login failed: missing token.", "Đăng nhập thất bại: thiếu token."));
    }

    setStoredToken(token);
    setStoredUser(user ?? null);
    window.dispatchEvent(new Event("auth-changed"));

    const isAdmin = resolveIsAdmin(payload);
    const target = nextPath && nextPath !== "/" ? nextPath : isAdmin ? "/admin" : "/my-learning";

    router.replace(target);
    router.refresh();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!mode) return;

    setLoading(true);
    setError("");
    setSuccessMessage("");
    setConfirmLink("");
    setResetLink("");
    setNeedsConfirmation(false);

    try {
      if (mode === "login") {
        const payload = await login(form.email.trim(), form.password);
        completeLogin(payload);
        return;
      }

      if (mode === "register") {
        const parts = form.name.trim().split(/\s+/).filter(Boolean);
        const firstName = parts[0] ?? "";
        const lastName = parts.slice(1).join(" ") || firstName;

        if (form.password.length < 8) {
          throw new Error(tx("Password must be at least 8 characters.", "Mật khẩu phải có ít nhất 8 ký tự."));
        }

        if (form.password !== form.confirm) {
          throw new Error(tx("Passwords do not match.", "Mật khẩu không khớp."));
        }

        const payload = await register(firstName, lastName, form.email.trim(), form.password);
        setSuccessMessage(payload.message ?? tx("Account created. Please confirm your email.", "Tạo tài khoản thành công. Vui lòng xác thực email."));
        if (payload.confirmLink) setConfirmLink(payload.confirmLink);
        return;
      }

      if (mode === "forgot") {
        const payload = await forgotPassword(form.email.trim());
        setSuccessMessage(payload.message ?? tx("If the email exists, a reset link was sent.", "Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi."));
        if (payload.resetLink) setResetLink(payload.resetLink);
        return;
      }

      if (mode === "reset") {
        if (!emailFromQuery || !tokenFromQuery) {
          throw new Error(tx("Missing reset token.", "Thiếu token đặt lại."));
        }
        if (form.resetPassword.length < 6) {
          throw new Error(tx("Password is too short.", "Mật khẩu quá ngắn."));
        }
        if (form.resetPassword !== form.confirm) {
          throw new Error(tx("Passwords do not match.", "Mật khẩu không khớp."));
        }

        await resetPassword(emailFromQuery, tokenFromQuery, form.resetPassword);
        setSuccessMessage(tx("Password updated. You can log in now.", "Đã đổi mật khẩu. Có thể đăng nhập lại."));
      }
    } catch (err) {
      if (mode === "login" && err instanceof Error && /confirm|verified|verification/i.test(err.message)) {
        setNeedsConfirmation(true);
      }
      setError(err instanceof Error ? err.message : tx("Something went wrong.", "Có lỗi xảy ra."));
    } finally {
      setLoading(false);
    }
  };

  return {
    mode,
    nextPath,
    loading,
    error,
    form,
    setForm,
    showPassword,
    setShowPassword,
    successMessage,
    confirmLink,
    resetLink,
    needsConfirmation,
    isOpen,
    closeModal,
    goToLogin,
    goToRegister,
    goToForgot,
    handleSubmit,
    tx,
  };
}
