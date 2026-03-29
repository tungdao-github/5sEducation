const STORAGE_KEY = "compare:courses";
export const COMPARE_EVENT = "compare:updated";

export function readCompareIds(): number[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((id) => typeof id === "number");
    }
  } catch {
    // ignore
  }

  return [];
}

export function writeCompareIds(ids: number[]) {
  if (typeof window === "undefined") return;
  const unique = Array.from(new Set(ids)).slice(0, 4);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
  window.dispatchEvent(new Event(COMPARE_EVENT));
}
