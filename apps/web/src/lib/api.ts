const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const fallbackApiUrl =  https://fiveseducation.onrender.com;
export const API_URL = (rawApiUrl && rawApiUrl.length > 0
  ? rawApiUrl
  : fallbackApiUrl
).replace(/\/+$/, );

export function resolveApiAsset(path?: string | null) {
 if (!path) return ;
  if (path.startsWith(http://) || path.startsWith(https://)) {
    return path;
  }
  return ${API_URL};
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(${API_URL}, {
    ...init,
    headers: {
      Content-Type: application/json,
      ...(init?.headers ?? {}),
    },
    cache: no-store,
  });

  if (!res.ok) {
    throw new Error(API error );
  }

  return res.json() as Promise<T>;
}