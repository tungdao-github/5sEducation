import { getRecord, getStringField, isRecord } from "@/lib/json";
const rawPublicApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const rawInternalApiUrl = process.env.INTERNAL_API_URL?.trim();
const fallbackServerApiUrl = "http://localhost:5158";
const fallbackBrowserApiUrl = "";

function normalizeApiBase(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  return trimmed.replace(/\/api\/?$/, "").replace(/\/+$/, "");
}

const resolvedApiUrl =
  typeof window === "undefined"
    ? rawInternalApiUrl || rawPublicApiUrl || fallbackServerApiUrl
    : rawPublicApiUrl || fallbackBrowserApiUrl;

export const API_URL = normalizeApiBase(resolvedApiUrl);

export const AUTH_TOKEN_KEY = "token";
export const LEGACY_AUTH_TOKEN_KEY = "auth_token";
export const AUTH_USER_KEY = "auth_user";


function dispatchAuthChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("auth-changed"));
}

export function resolveApiAsset(path?: string | null) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${API_URL}${path}`;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    window.localStorage.getItem(AUTH_TOKEN_KEY) ??
    window.localStorage.getItem(LEGACY_AUTH_TOKEN_KEY)
  );
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    window.localStorage.setItem(LEGACY_AUTH_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
  }
}

export function getStoredUser<T>() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setStoredUser(user: unknown | null) {
  if (typeof window === "undefined") return;
  if (user) {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(AUTH_USER_KEY);
  }
}

export function clearStoredAuth(options?: { notify?: boolean }) {
  setStoredToken(null);
  setStoredUser(null);
  if (options?.notify) {
    dispatchAuthChanged();
  }
}

function extractErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === "string" && payload.trim()) {
    return payload.trim();
  }

  if (Array.isArray(payload)) {
    const joined = payload
      .map((item) => String(item).trim())
      .filter(Boolean)
      .join("\n");
    if (joined) return joined;
  }

  if (isRecord(payload)) {
    const title = getStringField(payload, "title");
    if (title) return title;

    const detail = getStringField(payload, "detail");
    if (detail) return detail;

    const message = getStringField(payload, "message");
    if (message) return message;

    const errors = getRecord(payload, "errors");
    if (errors) {
      const messages = Object.values(errors)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .map((value) => String(value).trim())
        .filter(Boolean);
      if (messages.length > 0) return messages.join("\n");
    }
  }

  return fallback;
}

async function request<T>(path: string, init?: RequestInit, useAuth: boolean = false): Promise<T> {
  const token = useAuth ? getStoredToken() : null;
  if (useAuth && !token) {
    throw new Error("Bạn chưa đăng nhập.");
  }

  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let payload: unknown = null;
    try {
      payload = await res.json();
    } catch {
      try {
        payload = await res.text();
      } catch {
        payload = null;
      }
    }

    if (res.status === 401) {
      clearStoredAuth({ notify: true });
    }

    throw new Error(
      extractErrorMessage(
        payload,
        res.status === 401
          ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          : `API error ${res.status}`,
      ),
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export function fetchJson<T>(path: string, init?: RequestInit) {
  return request<T>(path, init, false);
}

export function fetchJsonWithAuth<T>(path: string, init?: RequestInit) {
  return request<T>(path, init, true);
}
