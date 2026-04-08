export type ClassValue =
  | string
  | number
  | false
  | null
  | undefined
  | ClassValue[]
  | { [key: string]: boolean | null | undefined };

function toClassNames(input: ClassValue): string[] {
  if (!input) return [];

  if (typeof input === "string" || typeof input === "number") {
    return [String(input)];
  }

  if (Array.isArray(input)) {
    return input.flatMap(toClassNames);
  }

  return Object.entries(input)
    .filter(([, enabled]) => Boolean(enabled))
    .map(([className]) => className);
}

export function cn(...inputs: ClassValue[]) {
  return inputs.flatMap(toClassNames).join(" ");
}
