"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/app/providers";
import {
  getGoogleClientId,
  loadGoogleIdentityScript,
  signInWithGoogleIdToken,
} from "@/lib/google-auth";

type GoogleSignInButtonProps = {
  nextPath: string;
  mode?: "signin" | "signup";
};

export function GoogleSignInButton({
  nextPath,
  mode = "signin",
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const { locale, tx } = useI18n();
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const clientId = getGoogleClientId();
    if (!clientId) {
      return;
    }

    let cancelled = false;

    const initializeGoogleButton = async () => {
      try {
        await loadGoogleIdentityScript();
        if (cancelled || !window.google?.accounts?.id || !buttonContainerRef.current) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          context: mode,
          callback: async (response) => {
            const credential = response.credential;
            if (!credential) {
              return;
            }

            setLoading(true);
            setError("");

            try {
              await signInWithGoogleIdToken(credential);
              router.push(nextPath);
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

        buttonContainerRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(buttonContainerRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: mode === "signup" ? "signup_with" : "signin_with",
          locale: locale === "vi" ? "vi" : "en",
          width: 320,
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : tx("Could not load Google sign-in.", "Khong the tai dang nhap Google.")
        );
      }
    };

    initializeGoogleButton();

    return () => {
      cancelled = true;
    };
  }, [locale, mode, nextPath, router, tx]);

  const clientId = getGoogleClientId();
  if (!clientId) {
    return (
      <p className="text-xs text-amber-700">
        {tx(
          "Google sign-in is not configured yet.",
          "Dang nhap Google chua duoc cau hinh."
        )}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-center" ref={buttonContainerRef} />
      {loading && (
        <p className="text-center text-xs text-emerald-700">
          {tx("Signing in with Google...", "Dang dang nhap bang Google...")}
        </p>
      )}
      {error && (
        <p className="text-center text-xs text-red-700">{error}</p>
      )}
    </div>
  );
}
