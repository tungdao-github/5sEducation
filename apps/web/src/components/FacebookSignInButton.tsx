"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/app/providers";
import {
  getFacebookAppId,
  hasInitializedFacebookSdk,
  initializeFacebookSdk,
  loadFacebookSdkScript,
  signInWithFacebookAccessToken,
} from "@/lib/facebook-auth";
import type { AuthPayload } from "@/lib/google-auth";

type FacebookSignInButtonProps = {
  nextPath: string;
  mode?: "signin" | "signup";
};

type FacebookAuthResponse = {
  authResponse?: {
    accessToken?: string;
  } | null;
};

const resolveIsAdmin = (payload: AuthPayload | null | undefined) => {
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

export function FacebookSignInButton({
  nextPath,
  mode = "signin",
}: FacebookSignInButtonProps) {
  const router = useRouter();
  const { tx } = useI18n();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const clientId = getFacebookAppId();
  const graphVersion = useMemo(() => process.env.NEXT_PUBLIC_FACEBOOK_GRAPH_VERSION?.trim() || "v20.0", []);
  const buttonLabel = mode === "signup" ? "Đăng ký bằng Facebook" : "Đăng nhập bằng Facebook";
  const configHint = tx(
    "Set NEXT_PUBLIC_FACEBOOK_APP_ID in apps/web/.env and FacebookAuth:AppId/AppSecret in apps/api/appsettings.Development.json.",
    "Can dat NEXT_PUBLIC_FACEBOOK_APP_ID trong apps/web/.env va FacebookAuth:AppId/AppSecret trong apps/api/appsettings.Development.json."
  );

  useEffect(() => {
    if (!clientId) {
      return;
    }

    let cancelled = false;

    const initializeFacebook = async () => {
      try {
        await loadFacebookSdkScript();
        if (cancelled || typeof window === "undefined") return;

        if (!hasInitializedFacebookSdk(clientId)) {
          initializeFacebookSdk(clientId);
        }

        if (!cancelled) {
          setReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : tx("Could not load Facebook sign-in.", "Khong the tai dang nhap Facebook.")
          );
        }
      }
    };

    void initializeFacebook();

    return () => {
      cancelled = true;
    };
  }, [clientId, graphVersion, tx]);

  const handleFacebookClick = async () => {
    if (!clientId) {
      setError(configHint);
      return;
    }

    try {
      setError("");
      setLoading(true);
      await loadFacebookSdkScript();
      initializeFacebookSdk(clientId);

      if (typeof window === "undefined" || !window.FB?.login) {
        throw new Error(tx("Could not load Facebook sign-in.", "Khong the tai dang nhap Facebook."));
      }

      const response = (await new Promise<FacebookAuthResponse | null>((resolve) => {
        window.FB?.login(
          (loginResponse) => {
            resolve(loginResponse ?? null);
          },
          {
            scope: "email,public_profile",
            return_scopes: true,
            auth_type: "rerequest",
          }
        );
      })) as FacebookAuthResponse | null;

      const accessToken = response?.authResponse?.accessToken;
      if (!accessToken) {
        throw new Error(tx("Facebook sign-in was cancelled.", "Dang nhap Facebook da bi huy."));
      }

      const auth = await signInWithFacebookAccessToken(accessToken);
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
          : tx("Facebook sign-in failed.", "Dang nhap Facebook that bai.")
      );
    } finally {
      setLoading(false);
    }
  };

  if (!clientId) {
    return (
      <div className="space-y-1 text-center">
        <p className="text-xs text-amber-700">
          {tx(
            "Facebook sign-in is not configured yet.",
            "Dang nhap Facebook chua duoc cau hinh."
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
        onClick={handleFacebookClick}
        disabled={loading || !ready}
        className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#1877F2] py-2.5 text-white transition-colors hover:bg-[#166FE5] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg className="size-5" fill="white" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        <span className="text-sm font-medium">{buttonLabel}</span>
      </button>
      {loading && (
        <p className="text-center text-xs text-emerald-700">
          {tx("Signing in with Facebook...", "Dang dang nhap bang Facebook...")}
        </p>
      )}
      {error && <p className="text-center text-xs text-red-700">{error}</p>}
      {!ready && (
        <p className="text-center text-[11px] text-slate-500">
          {tx("Preparing Facebook sign-in...", "Dang chuan bi dang nhap Facebook...")}
        </p>
      )}
    </div>
  );
}
