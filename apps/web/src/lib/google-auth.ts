import { API_URL, setStoredToken } from "@/lib/api";

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleAccountsId = {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    context?: "signin" | "signup";
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    use_fedcm_for_prompt?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      shape?: "rectangular" | "pill" | "circle" | "square";
      text?: "signin_with" | "signup_with" | "continue_with";
      width?: number | string;
      locale?: string;
    }
  ) => void;
  prompt: (callback?: () => void) => void;
  cancel: () => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}

export type AuthPayload = {
  token?: string;
  Token?: string;
  user?: {
    isAdmin?: boolean;
    IsAdmin?: boolean;
    roles?: string[];
    Roles?: string[];
  };
  User?: {
    isAdmin?: boolean;
    IsAdmin?: boolean;
    roles?: string[];
    Roles?: string[];
  };
};

let googleScriptPromise: Promise<void> | null = null;
const googleInitializedClientIds = new Set<string>();
const explicitAllowedOrigins = (process.env.NEXT_PUBLIC_GOOGLE_AUTH_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const siteUrlOrigin = (() => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!siteUrl) {
    return "";
  }

  try {
    return new URL(siteUrl).origin;
  } catch {
    return "";
  }
})();

function getErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
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

    const errors = record.errors;
    if (errors && typeof errors === "object") {
      const messages = Object.values(errors as Record<string, unknown>)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .map((value) => String(value).trim())
        .filter(Boolean);
      if (messages.length > 0) {
        return messages.join("\n");
      }
    }
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

  return fallback;
}

export function getGoogleClientId() {
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
}

export function getBrowserOrigin() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.origin;
}

export function isGoogleAuthAllowedOrigin() {
  if (typeof window === "undefined") {
    return false;
  }

  const origin = getBrowserOrigin();
  if (explicitAllowedOrigins.length > 0) {
    return explicitAllowedOrigins.includes(origin);
  }

  if (siteUrlOrigin && siteUrlOrigin === origin) {
    return true;
  }

  return origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:");
}

export function hasInitializedGoogleIdentity(clientId: string) {
  return googleInitializedClientIds.has(clientId);
}

export function markGoogleIdentityInitialized(clientId: string) {
  googleInitializedClientIds.add(clientId);
}

export async function loadGoogleIdentityScript() {
  if (typeof window === "undefined") {
    return;
  }

  if (window.google?.accounts?.id) {
    return;
  }

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise<void>((resolve, reject) => {
      const rejectWithReset = (error: Error) => {
        googleScriptPromise = null;
        reject(error);
      };
      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[src="https://accounts.google.com/gsi/client"]'
      );

      if (existingScript) {
        if (existingScript.dataset.loaded === "true") {
          resolve();
          return;
        }
        existingScript.addEventListener("load", () => resolve(), {
          once: true,
        });
        existingScript.addEventListener(
          "error",
          () => rejectWithReset(new Error("Could not load Google script.")),
          { once: true }
        );
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.dataset.loaded = "false";
      script.onload = () => {
        script.dataset.loaded = "true";
        resolve();
      };
      script.onerror = () => rejectWithReset(new Error("Could not load Google script."));
      document.head.appendChild(script);
    });
  }

  return googleScriptPromise;
}

export async function signInWithGoogleIdToken(idToken: string) {
  const res = await fetch(`${API_URL}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
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

    throw new Error(getErrorMessage(payload || rawText, "Google sign-in failed."));
  }

  const data = (await res.json()) as AuthPayload;
  const token = data?.token ?? data?.Token;
  if (!token) {
    throw new Error("Google sign-in failed: missing token.");
  }

  setStoredToken(token);
  window.dispatchEvent(new Event("auth-changed"));
  return data;
}


