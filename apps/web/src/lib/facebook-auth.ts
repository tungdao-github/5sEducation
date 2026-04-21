import { API_URL, setStoredToken } from "@/lib/api";
import type { AuthPayload } from "@/lib/google-auth";

type FacebookLoginResponse = {
  authResponse?: {
    accessToken?: string;
  } | null;
  status?: string;
};

type FacebookSdk = {
  init: (options: {
    appId: string;
    cookie?: boolean;
    xfbml?: boolean;
    version?: string;
  }) => void;
  login: (
    callback: (response: FacebookLoginResponse) => void,
    options?: {
      scope?: string;
      return_scopes?: boolean;
      auth_type?: "rerequest" | "reauthenticate" | "reauthorize";
    }
  ) => void;
};

declare global {
  interface Window {
    FB?: FacebookSdk;
    fbAsyncInit?: () => void;
  }
}

let facebookScriptPromise: Promise<void> | null = null;
const facebookInitializedAppIds = new Set<string>();

function getErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === "string" && payload.trim()) {
    return payload.trim();
  }

  if (Array.isArray(payload)) {
    const joined = payload
      .map((item) => String(item).trim())
      .filter(Boolean)
      .join("\n");
    if (joined) {
      return joined;
    }
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const title = typeof record.title === "string" ? record.title.trim() : "";
    if (title) {
      return title;
    }

    const detail = typeof record.detail === "string" ? record.detail.trim() : "";
    if (detail) {
      return detail;
    }

    const message = typeof record.message === "string" ? record.message.trim() : "";
    if (message) {
      return message;
    }
  }

  return fallback;
}

export function getFacebookAppId() {
  return process.env.NEXT_PUBLIC_FACEBOOK_APP_ID?.trim() ?? "";
}

export function getFacebookGraphVersion() {
  return process.env.NEXT_PUBLIC_FACEBOOK_GRAPH_VERSION?.trim() || "v20.0";
}

export function hasInitializedFacebookSdk(appId: string) {
  return facebookInitializedAppIds.has(appId);
}

export function markFacebookSdkInitialized(appId: string) {
  facebookInitializedAppIds.add(appId);
}

export async function loadFacebookSdkScript() {
  if (typeof window === "undefined") {
    return;
  }

  if (window.FB?.init) {
    return;
  }

  if (!facebookScriptPromise) {
    facebookScriptPromise = new Promise<void>((resolve, reject) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        resolve();
      };
      const fail = (error: Error) => {
        if (settled) return;
        settled = true;
        facebookScriptPromise = null;
        reject(error);
      };

      const existingScript = document.getElementById("facebook-jssdk") as HTMLScriptElement | null;
      if (existingScript) {
        if (existingScript.dataset.loaded === "true" && window.FB?.init) {
          finish();
          return;
        }

        existingScript.addEventListener("load", finish, { once: true });
        existingScript.addEventListener("error", () => fail(new Error("Could not load Facebook script.")), {
          once: true,
        });
        return;
      }

      const previousInit = window.fbAsyncInit;
      window.fbAsyncInit = () => {
        try {
          previousInit?.();
        } finally {
          finish();
        }
      };

      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.onload = () => {
        script.dataset.loaded = "true";
      };
      script.onerror = () => fail(new Error("Could not load Facebook script."));
      document.head.appendChild(script);
    });
  }

  return facebookScriptPromise;
}

export function initializeFacebookSdk(appId: string) {
  if (typeof window === "undefined" || !appId || !window.FB?.init) {
    return;
  }

  if (hasInitializedFacebookSdk(appId)) {
    return;
  }

  window.FB.init({
    appId,
    cookie: true,
    xfbml: false,
    version: getFacebookGraphVersion(),
  });

  markFacebookSdkInitialized(appId);
}

export async function signInWithFacebookAccessToken(accessToken: string) {
  const res = await fetch(`${API_URL}/api/auth/facebook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken }),
  });

  if (!res.ok) {
    let payload: unknown = null;
    let rawText = "";
    try {
      payload = await res.json();
    } catch {
      try {
        rawText = await res.text();
      } catch {
        // ignore parse errors
      }
    }

    throw new Error(getErrorMessage(payload || rawText, "Facebook sign-in failed."));
  }

  const data = (await res.json()) as AuthPayload;
  const token = data?.token ?? data?.Token;
  if (!token) {
    throw new Error("Facebook sign-in failed: missing token.");
  }

  setStoredToken(token);
  window.dispatchEvent(new Event("auth-changed"));
  return data;
}
