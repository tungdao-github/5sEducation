"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  getGoogleClientId,
  hasInitializedGoogleIdentity,
  loadGoogleIdentityScript,
  isGoogleAuthAllowedOrigin,
  markGoogleIdentityInitialized,
  signInWithGoogleIdToken,
} from "@/lib/google-auth";

const DISABLED_PATHS = new Set([
  "/forgot-password",
  "/reset-password",
]);

export function GoogleOneTap() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const authMode = searchParams.get("auth");

  useEffect(() => {
    const clientId = getGoogleClientId();
    if (!clientId) {
      return;
    }

    if (!isGoogleAuthAllowedOrigin()) {
      return;
    }

    if (
      DISABLED_PATHS.has(pathname) ||
      (authMode && authMode !== "login" && authMode !== "register")
    ) {
      return;
    }

    if (typeof window === "undefined" || localStorage.getItem("token")) {
      return;
    }

    let cancelled = false;
    let visibilityHandler: (() => void) | null = null;

    const initializeOneTap = async () => {
      try {
        await loadGoogleIdentityScript();
        if (cancelled || !window.google?.accounts?.id) {
          return;
        }

        if (!hasInitializedGoogleIdentity(clientId)) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            context: "signin",
            auto_select: false,
            cancel_on_tap_outside: true,
            callback: async (response) => {
              const credential = response.credential;
              if (!credential) {
                return;
              }

              try {
                await signInWithGoogleIdToken(credential);
                router.refresh();
              } catch {
                // ignore one-tap failures silently
              }
            },
          });
          markGoogleIdentityInitialized(clientId);
        }

        const prompt = () => {
          window.google?.accounts?.id?.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              return;
            }
          });
        };

        if (document.visibilityState !== "visible") {
          visibilityHandler = () => {
            if (document.visibilityState === "visible") {
              prompt();
              if (visibilityHandler) {
                document.removeEventListener("visibilitychange", visibilityHandler);
              }
            }
          };
          document.addEventListener("visibilitychange", visibilityHandler);
          return;
        }

        prompt();
      } catch {
        // ignore one-tap setup failures silently
      }
    };

    initializeOneTap();

    return () => {
      cancelled = true;
      window.google?.accounts?.id?.cancel?.();
      if (visibilityHandler) {
        document.removeEventListener("visibilitychange", visibilityHandler);
      }
    };
  }, [pathname, authMode, router]);

  return null;
}
