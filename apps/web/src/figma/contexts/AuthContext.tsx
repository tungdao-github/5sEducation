"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { fetchJson, fetchJsonWithAuth, getStoredToken, setStoredToken } from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
  points: number;
  level: "Bronze" | "Silver" | "Gold" | "Platinum";
  joinDate: string;
  phone?: string;
  bio?: string;
}

type AuthMode = "login" | "register" | "forgot";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void> | void;
  showAuthModal: boolean;
  authMode: AuthMode;
  openAuthModal: (mode?: AuthMode) => void;
  closeAuthModal: () => void;
}

type ApiUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  isAdmin?: boolean;
  IsAdmin?: boolean;
  emailConfirmed?: boolean;
  loyaltyPoints?: number;
  loyaltyTier?: string;
  createdAt?: string;
};

type AuthResponse = {
  token?: string;
  Token?: string;
  user?: ApiUser;
  User?: ApiUser;
};

const PROFILE_EXTRAS_KEY = "profile_extras";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function resolveUser(dto: ApiUser | null | undefined): User | null {
  if (!dto) return null;
  const fullName = `${dto.firstName ?? ""} ${dto.lastName ?? ""}`.trim();
  const storedExtras = typeof window !== "undefined" ? window.localStorage.getItem(PROFILE_EXTRAS_KEY) : null;
  let extras: { phone?: string; bio?: string } = {};
  if (storedExtras) {
    try {
      extras = JSON.parse(storedExtras);
    } catch {
      extras = {};
    }
  }
  const isAdmin = dto.isAdmin ?? dto.IsAdmin ?? false;
  const tier = (dto.loyaltyTier as User["level"]) || "Bronze";
  return {
    id: dto.id,
    name: fullName || dto.email,
    email: dto.email,
    avatar: dto.avatarUrl ?? undefined,
    role: isAdmin ? "admin" : "user",
    points: dto.loyaltyPoints ?? 0,
    level: tier,
    joinDate: dto.createdAt ?? new Date().toISOString().split("T")[0],
    phone: dto.phoneNumber ?? extras.phone,
    bio: extras.bio,
  };
}

function extractToken(payload: AuthResponse) {
  return payload.token ?? payload.Token ?? "";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  const loadCurrentUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const data = await fetchJsonWithAuth<ApiUser>("/api/auth/me");
      setUser(resolveUser(data));
    } catch (error) {
      console.error("Failed to load current user", error);
      setStoredToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => loadCurrentUser();
    window.addEventListener("auth-changed", handler);
    return () => window.removeEventListener("auth-changed", handler);
  }, [loadCurrentUser]);

  const login = async (email: string, password: string) => {
    try {
      const data = await fetchJson<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const token = extractToken(data);
      if (!token) {
        return { success: false, message: "Đăng nhập thất bại: thiếu token" };
      }

      setStoredToken(token);
      const apiUser = data.user ?? data.User;
      const resolved = resolveUser(apiUser);
      setUser(resolved);
      setShowAuthModal(false);

      if (typeof window !== "undefined") {
        if (resolved?.role === "admin") {
          window.location.assign("/admin");
        } else {
          window.location.assign("/");
        }
      }

      return { success: true, message: "Đăng nhập thành công!" };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Email hoặc mật khẩu không đúng",
      };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const parts = name.trim().split(/\s+/);
      const firstName = parts.shift() ?? "";
      const lastName = parts.join(" ") || firstName;

      const res = await fetchJson<{ message?: string }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      setShowAuthModal(false);
      return {
        success: true,
        message: res?.message || "Đăng ký thành công. Vui lòng xác thực email.",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Đăng ký thất bại",
      };
    }
  };

  const logout = () => {
    setUser(null);
    setStoredToken(null);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth-changed"));
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;

    const extras: { phone?: string; bio?: string } = {
      phone: data.phone ?? user.phone,
      bio: data.bio ?? user.bio,
    };

    if (typeof window !== "undefined") {
      window.localStorage.setItem(PROFILE_EXTRAS_KEY, JSON.stringify(extras));
    }

    const [firstName = "", ...rest] = (data.name ?? user.name).split(/\s+/);
    const lastName = rest.join(" ") || firstName;

    try {
      const updated = await fetchJsonWithAuth<ApiUser>("/api/auth/me", {
        method: "PUT",
        body: JSON.stringify({ firstName, lastName, avatarUrl: data.avatar }),
      });
      setUser(resolveUser(updated));
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  const openAuthModal = (mode: AuthMode = "login") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => setShowAuthModal(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        login,
        register,
        logout,
        updateUser,
        showAuthModal,
        authMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
