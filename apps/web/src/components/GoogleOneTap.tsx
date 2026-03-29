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
    const clientId = getGoogleClientId();
    if (!clientId) {
      return;
    }

    if (typeof window === "undefined" || localStorage.getItem("token")) {
      return;
    }

    let cancelled = false;

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

        window.google.accounts.id.prompt();
      } catch {
        // ignore one-tap setup failures silently
      }
    };

    initializeOneTap();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return null;
}
