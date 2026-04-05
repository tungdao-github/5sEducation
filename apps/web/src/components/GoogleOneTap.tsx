"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getGoogleClientId,
  loadGoogleIdentityScript,
  signInWithGoogleIdToken,
} from "@/lib/google-auth";

export function GoogleOneTap() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const disabledPaths = new Set([
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
    ]);

    const clientId = getGoogleClientId();
    if (!clientId) {
      return;
    }

    if (disabledPaths.has(pathname)) {
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

        window.google.accounts.id.initialize({
          client_id: clientId,
          context: "signin",
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false,
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

        const prompt = () => {
          window.google?.accounts?.id?.prompt(() => {
            // Ignore prompt moment notifications; we only need user auth.
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
      if (visibilityHandler) {
        document.removeEventListener("visibilitychange", visibilityHandler);
      }
    };
  }, [pathname, router]);

  return null;
}
