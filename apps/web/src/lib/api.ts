export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5158";

export function resolveApiAsset(path?: string | null) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${API_URL}${path}`;
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }

  return res.json() as Promise<T>;
}
