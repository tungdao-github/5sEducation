export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getStringField(value: unknown, key: string): string | undefined {
  if (!isRecord(value)) return undefined;
  const field = value[key];
  return typeof field === "string" && field.trim() ? field.trim() : undefined;
}

export function getRecord(value: unknown, key: string): Record<string, unknown> | undefined {
  if (!isRecord(value)) return undefined;
  const field = value[key];
  return isRecord(field) ? field : undefined;
}

export function parseJson<T>(input: string, guard?: (value: unknown) => value is T): T | null {
  if (!input) return null;
  try {
    const parsed: unknown = JSON.parse(input);
    if (!guard) {
      return parsed as T;
    }
    return guard(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function parseJsonArray<T>(input: string, guard: (value: unknown) => value is T): T[] {
  const parsed = parseJson<unknown[]>(input);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(guard);
}
