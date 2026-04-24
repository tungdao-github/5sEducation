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
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const currentOrigin = getBrowserOrigin();
  const clientId = getGoogleClientId();
  const originAllowed = isGoogleAuthAllowedOrigin();

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

  useEffect(() => {
    if (!clientId || !originAllowed) {
      return;
    }

    let cancelled = false;

    const initializeGoogle = async () => {
      try {
        await loadGoogleIdentityScript();
        if (cancelled || !window.google?.accounts?.id) {
          return;
        }

        if (!hasInitializedGoogleIdentity(clientId)) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            context: mode,
            auto_select: false,
            button_auto_select: false,
            use_fedcm_for_button: true,
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

        if (!buttonRef.current || cancelled) {
          return;
        }

        buttonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text: mode === "signup" ? "signup_with" : "signin_with",
          shape: "rectangular",
          width: "100%",
          click_listener: () => {
            setError("");
          },
        });

        setReady(true);
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
      if (buttonRef.current) {
        buttonRef.current.innerHTML = "";
      }
    };
  }, [clientId, mode, nextPath, originAllowed, router, tx]);

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

  if (!originAllowed) {
    return (
      <div className="space-y-1 text-center">
        <p className="text-xs text-amber-700">
          {tx(
            `Google sign-in is disabled on this origin: ${currentOrigin || "unknown"}`,
            `Dang nhap Google tam tat tren origin nay: ${currentOrigin || "khong ro"}`
          )}
        </p>
        {originHint && (
          <p className="text-[11px] text-amber-700/80">{originHint}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2" data-next-path={nextPath}>
      <div
        ref={buttonRef}
        className="min-h-[44px] overflow-hidden rounded-lg"
        aria-label={tx("Dang nhap bang Google", "Dang nhap bang Google")}
      />

      {loading && (
        <p className="text-center text-xs text-emerald-700">
          {tx("Signing in with Google...", "Dang dang nhap bang Google...")}
        </p>
      )}

      {error && <p className="text-center text-xs text-red-700">{error}</p>}

      {!error && originHint && (
        <p className="text-center text-[11px] text-slate-500">{originHint}</p>
      )}

      {!ready && (
        <p className="text-center text-[11px] text-slate-400">
          {tx("Preparing Google sign-in...", "Dang khoi tao dang nhap Google...")}
        </p>
      )}
    </div>
  );
}
