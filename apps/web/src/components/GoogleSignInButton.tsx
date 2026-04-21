"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/app/providers";
import {
  getBrowserOrigin,
  getGoogleClientId,
  hasInitializedGoogleIdentity,
  isGoogleAuthAllowedOrigin,
  loadGoogleIdentityScript,
  markGoogleIdentityInitialized,
  signInWithGoogleIdToken,
  type AuthPayload,
} from "@/lib/google-auth";

type GoogleSignInButtonProps = {
  nextPath: string;
  mode?: "signin" | "signup";
};

type UserPayload = NonNullable<AuthPayload["user"]>;

const resolveIsAdmin = (payload: AuthPayload | null | undefined) => {
  const user: UserPayload | undefined = payload?.user ?? payload?.User;
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

export function GoogleSignInButton({
  nextPath,
  mode = "signin",
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const { tx } = useI18n();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const readyRef = useRef(false);
  const currentOrigin = getBrowserOrigin();
  const configHint = tx(
    "Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in apps/web/.env and GoogleAuth:ClientId in apps/api/appsettings.Development.json.",
    "Can dat NEXT_PUBLIC_GOOGLE_CLIENT_ID trong apps/web/.env va GoogleAuth:ClientId trong apps/api/appsettings.Development.json."
  );
  const originHint = currentOrigin
    ? tx(
        `Add this origin to Google Cloud Console > Authorized JavaScript origins: ${currentOrigin}`,
        `Them origin nay vao Google Cloud Console > Authorized JavaScript origins: ${currentOrigin}`
      )
    : "";
  const originAllowed = isGoogleAuthAllowedOrigin();

  useEffect(() => {
    const clientId = getGoogleClientId();
    if (!clientId || !originAllowed) {
      return;
    }

    let cancelled = false;

    const initializeGoogle = async () => {
      try {
        await loadGoogleIdentityScript();
        if (cancelled || !window.google?.accounts?.id) return;

        if (!hasInitializedGoogleIdentity(clientId)) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            context: mode,
            callback: async (response) => {
              const credential = response.credential;
              if (!credential) return;

              setLoading(true);
              setError("");

              try {
                const auth = await signInWithGoogleIdToken(credential);
                const isAdmin = resolveIsAdmin(auth);
                const targetPath =
                  nextPath && nextPath.startsWith("/")
                    ? nextPath
                    : isAdmin
                      ? "/admin"
                      : "/my-learning";
                router.push(targetPath);
              } catch (err) {
                setError(
                  err instanceof Error
                    ? err.message
                    : tx("Google sign-in failed.", "Dang nhap Google that bai.")
                );
              } finally {
                setLoading(false);
              }
            },
          });
          markGoogleIdentityInitialized(clientId);
        }

        readyRef.current = true;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : tx("Could not load Google sign-in.", "Khong the tai dang nhap Google.")
        );
      }
    };

    initializeGoogle();

    return () => {
      cancelled = true;
      window.google?.accounts?.id?.cancel?.();
    };
  }, [mode, nextPath, originAllowed, router, tx]);

  const handleGoogleClick = async () => {
    const clientId = getGoogleClientId();
    if (!clientId) return;

    if (!originAllowed) {
      setError(
        tx(
          `Google sign-in is disabled on this origin: ${currentOrigin || "unknown"}`,
          `Dang nhap Google tam tat tren origin nay: ${currentOrigin || "khong ro"}`
        )
      );
      return;
    }

    try {
      setError("");
      await loadGoogleIdentityScript();
      if (!readyRef.current) {
        window.google?.accounts?.id?.initialize({
          client_id: clientId,
          context: mode,
          callback: async (response) => {
            const credential = response.credential;
            if (!credential) return;

            try {
              const auth = await signInWithGoogleIdToken(credential);
              const isAdmin = resolveIsAdmin(auth);
              const targetPath =
                nextPath && nextPath.startsWith("/")
                  ? nextPath
                  : isAdmin
                    ? "/admin"
                    : "/my-learning";
              router.push(targetPath);
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : tx("Google sign-in failed.", "Dang nhap Google that bai.")
              );
            } finally {
              setLoading(false);
            }
          },
        });
        readyRef.current = true;
      }
      window.google?.accounts?.id?.prompt();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : tx("Could not load Google sign-in.", "Khong the tai dang nhap Google.")
      );
    }
  };

  const clientId = getGoogleClientId();
  const showConfigHint =
    error.toLowerCase().includes("not configured") ||
    error.toLowerCase().includes("client id") ||
    !originAllowed;

  if (!clientId) {
    return (
      <div className="space-y-1 text-center">
        <p className="text-xs text-amber-700">
          {tx(
            "Google sign-in is not configured yet.",
            "Dang nhap Google chua duoc cau hinh."
          )}
        </p>
        <p className="text-[11px] text-amber-700/80">{configHint}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2" data-next-path={nextPath}>
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-2.5 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        <span className="text-sm font-medium text-slate-700">
          {tx("Đăng nhập bằng Google", "Dang nhap bang Google")}
        </span>
      </button>
      {loading && (
        <p className="text-center text-xs text-emerald-700">
          {tx("Signing in with Google...", "Dang dang nhap bang Google...")}
        </p>
      )}
      {error && <p className="text-center text-xs text-red-700">{error}</p>}
      {showConfigHint && (
        <p className="text-center text-[11px] text-amber-700">
          {!originAllowed
            ? tx(
                `Google sign-in is disabled on this origin: ${currentOrigin || "unknown"}`,
                `Dang nhap Google tam tat tren origin nay: ${currentOrigin || "khong ro"}`
              )
            : configHint}
        </p>
      )}
      {!showConfigHint && originHint && (
        <p className="text-center text-[11px] text-slate-500">{originHint}</p>
      )}
    </div>
  );
}
