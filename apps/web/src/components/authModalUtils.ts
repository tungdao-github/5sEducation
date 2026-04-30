import type { AuthMode } from "@/components/AuthModalBody";

export type AuthResponse = {
  token?: string;
  Token?: string;
  user?: {
    isAdmin?: boolean;
    IsAdmin?: boolean;
    roles?: string[];
    Roles?: string[];
    avatarUrl?: string | null;
    AvatarUrl?: string | null;
    email?: string;
    Email?: string;
    firstName?: string;
    FirstName?: string;
    lastName?: string;
    LastName?: string;
  };
  User?: AuthResponse["user"];
  message?: string;
  confirmLink?: string;
  resetLink?: string;
};

export const resolveMode = (value: string | null): AuthMode | null => {
  switch (value) {
    case "login":
    case "register":
    case "forgot":
    case "reset":
    case "confirm-email":
      return value;
    default:
      return null;
  }
};

export const sanitizeNextPath = (value: string | null) => {
  if (!value) return "/";
  if (!value.startsWith("/")) return "/";
  if (value.startsWith("//")) return "/";
  return value;
};

export const resolveIsAdmin = (payload: AuthResponse | null | undefined) => {
  const user = payload?.user ?? payload?.User;
  if (!user) return false;
  if (typeof user.isAdmin === "boolean") return user.isAdmin;
  if (typeof user.IsAdmin === "boolean") return user.IsAdmin;
  const roles = Array.isArray(user.roles) ? user.roles : Array.isArray(user.Roles) ? user.Roles : [];
  return roles.some((role) => String(role).toLowerCase() === "admin");
};

export const buildAuthUrl = (mode: AuthMode, nextPath: string) => {
  const params = new URLSearchParams();
  params.set("auth", mode);
  params.set("next", nextPath);
  return `/?${params.toString()}`;
};
