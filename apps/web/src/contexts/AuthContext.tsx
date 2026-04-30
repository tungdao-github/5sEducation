"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  clearStoredAuth,
  fetchJson,
  fetchJsonWithAuth,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
} from "@/lib/api";

export interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: "user" | "admin" | "instructor";
  roles: string[];
  points: number;
  level: "Bronze" | "Silver" | "Gold" | "Platinum";
  joinDate: string;
  phone?: string;
  bio?: string;
  emailConfirmed?: boolean;
  status?: string;
  instructorStatus?: "pending" | "approved" | "rejected";
  expertise?: string[];
  socialLinks?: {
    website?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
}

type AuthMode = "login" | "register" | "forgot";
type AuthResult = { success: boolean; message: string };

type UserDto = {
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
  status?: string;
  roles?: string[];
  Roles?: string[];
};

type AuthResponse = {
  token?: string;
  Token?: string;
  user?: UserDto;
  User?: UserDto;
  expiresAt?: string;
};

type ForgotPasswordResponse = {
  message?: string;
  resetLink?: string;
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInstructor: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  forgotPassword: (email: string) => Promise<AuthResult>;
  loginWithGoogleIdToken: (idToken: string) => Promise<AuthResult>;
  loginWithFacebookAccessToken: (accessToken: string) => Promise<AuthResult>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<AuthResult>;
  applyAsInstructor: (data: {
    expertise: string[];
    bio: string;
    socialLinks?: User["socialLinks"];
  }) => Promise<AuthResult>;
  showAuthModal: boolean;
  authMode: AuthMode;
  openAuthModal: (mode?: AuthMode) => void;
  closeAuthModal: () => void;
}

const AUTH_CHANGE_EVENT = "auth-changed";
const PROFILE_EXTRAS_KEY = "profile_extras";
const AuthContext = createContext<AuthContextType | undefined>(undefined);

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: "Edu", lastName: "User" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: parts[0] };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function extractToken(payload: AuthResponse) {
  return payload.token ?? payload.Token ?? "";
}

function readProfileExtras() {
  if (typeof window === "undefined") return {} as Pick<User, "bio" | "phone" | "instructorStatus" | "expertise" | "socialLinks">;
  const raw = window.localStorage.getItem(PROFILE_EXTRAS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Pick<User, "bio" | "phone" | "instructorStatus" | "expertise" | "socialLinks">;
  } catch {
    return {};
  }
}

function writeProfileExtras(user: Partial<User>) {
  if (typeof window === "undefined") return;
  const current = readProfileExtras();
  window.localStorage.setItem(
    PROFILE_EXTRAS_KEY,
    JSON.stringify({
      ...current,
      bio: user.bio ?? current.bio,
      phone: user.phone ?? current.phone,
      instructorStatus: user.instructorStatus ?? current.instructorStatus,
      expertise: user.expertise ?? current.expertise,
      socialLinks: user.socialLinks ?? current.socialLinks,
    }),
  );
}

function toUser(dto: UserDto): User {
  const roles = Array.isArray(dto.roles)
    ? dto.roles
    : Array.isArray(dto.Roles)
      ? dto.Roles
      : [];
  const isAdmin = dto.isAdmin ?? dto.IsAdmin ?? roles.some((role) => role.toLowerCase() === "admin");
  const isInstructor = roles.some((role) => role.toLowerCase() === "instructor");
  const fullName = `${dto.firstName ?? ""} ${dto.lastName ?? ""}`.trim() || dto.email;
  const extras = readProfileExtras();

  return {
    id: dto.id,
    name: fullName,
    firstName: dto.firstName ?? "",
    lastName: dto.lastName ?? "",
    email: dto.email,
    avatar: dto.avatarUrl ?? undefined,
    role: isAdmin ? "admin" : isInstructor ? "instructor" : "user",
    roles,
    points: dto.loyaltyPoints ?? 0,
    level: (dto.loyaltyTier || "Bronze") as User["level"],
    joinDate: dto.createdAt ?? new Date().toISOString(),
    phone: dto.phoneNumber ?? extras.phone,
    bio: extras.bio,
    emailConfirmed: dto.emailConfirmed ?? true,
    status: dto.status,
    instructorStatus: extras.instructorStatus,
    expertise: extras.expertise,
    socialLinks: extras.socialLinks,
  };
}

function persistUser(user: User | null) {
  setStoredUser(user);
}

function restoreStoredUser() {
  return getStoredUser<User>();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  const hydrateUser = useCallback(async () => {
    const token = getStoredToken();
    const cachedUser = restoreStoredUser();

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    if (cachedUser) {
      setUser(cachedUser);
    }

    try {
      const dto = await fetchJsonWithAuth<UserDto>("/api/auth/me");
      const mappedUser = toUser(dto);
      setUser(mappedUser);
      persistUser(mappedUser);
    } catch {
      clearStoredAuth();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!mounted) return;
      await hydrateUser();
    };

    const handleAuthChanged = () => {
      void run();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key !== AUTH_TOKEN_KEY && event.key !== AUTH_USER_KEY) {
        return;
      }
      void run();
    };

    void run();
    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChanged);
    window.addEventListener("storage", handleStorage);

    return () => {
      mounted = false;
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChanged);
      window.removeEventListener("storage", handleStorage);
    };
  }, [hydrateUser]);

  const completeLogin = (response: AuthResponse, message: string): AuthResult => {
    const token = extractToken(response);
    const userDto = response.user ?? response.User;
    if (!token || !userDto) {
      return { success: false, message: "Đăng nhập thất bại: thiếu thông tin phiên." };
    }

    const mappedUser = toUser(userDto);
    setStoredToken(token);
    persistUser(mappedUser);
    setUser(mappedUser);
    setIsLoading(false);
    setShowAuthModal(false);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    return { success: true, message };
  };

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await fetchJson<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      return completeLogin(response, "Đăng nhập thành công.");
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Đăng nhập thất bại." };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResult> => {
    try {
      const parts = splitFullName(name);
      await fetchJson<{ message?: string }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          firstName: parts.firstName,
          lastName: parts.lastName,
        }),
      });

      const loginResult = await login(email, password);
      if (loginResult.success) {
        return loginResult;
      }

      return {
        success: true,
        message: "Đăng ký thành công. Nếu chưa đăng nhập được, hãy xác thực email trước.",
      };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Đăng ký thất bại." };
    }
  };

  const forgotPassword = async (email: string): Promise<AuthResult> => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      return { success: false, message: "Vui lòng nhập email để nhận liên kết đặt lại mật khẩu." };
    }

    try {
      const resetUrl = typeof window !== "undefined" ? `${window.location.origin}/reset-password` : "";
      const response = await fetchJson<ForgotPasswordResponse>("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: normalizedEmail, resetUrl }),
      });

      return {
        success: true,
        message: response.message || "Nếu email tồn tại, hệ thống đã gửi liên kết đặt lại mật khẩu.",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Không thể gửi liên kết đặt lại mật khẩu.",
      };
    }
  };

  const loginWithGoogleIdToken = async (idToken: string): Promise<AuthResult> => {
    try {
      const response = await fetchJson<AuthResponse>("/api/auth/google", {
        method: "POST",
        body: JSON.stringify({ idToken }),
      });
      return completeLogin(response, "Đăng nhập Google thành công.");
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Đăng nhập Google thất bại." };
    }
  };

  const loginWithFacebookAccessToken = async (accessToken: string): Promise<AuthResult> => {
    try {
      const response = await fetchJson<AuthResponse>("/api/auth/facebook", {
        method: "POST",
        body: JSON.stringify({ accessToken }),
      });
      return completeLogin(response, "Đăng nhập Facebook thành công.");
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Đăng nhập Facebook thất bại." };
    }
  };

  const logout = () => {
    clearStoredAuth({ notify: true });
    setUser(null);
    setShowAuthModal(false);
  };

  const updateUser = async (data: Partial<User>): Promise<AuthResult> => {
    if (!user) {
      return { success: false, message: "Bạn chưa đăng nhập." };
    }

    writeProfileExtras(data);

    try {
      const name = data.name ?? `${data.firstName ?? user.firstName} ${data.lastName ?? user.lastName}`.trim();
      const parts = splitFullName(name);
      const dto = await fetchJsonWithAuth<UserDto>("/api/auth/me", {
        method: "PUT",
        body: JSON.stringify({
          firstName: parts.firstName,
          lastName: parts.lastName,
          avatarUrl: data.avatar ?? user.avatar ?? null,
        }),
      });

      const updatedUser = {
        ...toUser(dto),
        bio: data.bio ?? user.bio,
        phone: data.phone ?? user.phone,
        instructorStatus: data.instructorStatus ?? user.instructorStatus,
        expertise: data.expertise ?? user.expertise,
        socialLinks: data.socialLinks ?? user.socialLinks,
      };

      setUser(updatedUser);
      persistUser(updatedUser);
      return { success: true, message: "Cập nhật hồ sơ thành công." };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Cập nhật hồ sơ thất bại." };
    }
  };

  const applyAsInstructor = async (data: {
    expertise: string[];
    bio: string;
    socialLinks?: User["socialLinks"];
  }): Promise<AuthResult> => {
    if (!user) {
      return { success: false, message: "Bạn chưa đăng nhập." };
    }

    const nextUser: User = {
      ...user,
      instructorStatus: "pending",
      bio: data.bio,
      expertise: data.expertise,
      socialLinks: data.socialLinks,
    };

    writeProfileExtras(nextUser);
    setUser(nextUser);
    persistUser(nextUser);

    return {
      success: true,
      message: "Đơn đăng ký đã được lưu. Bạn có thể nối backend duyệt giảng viên ở bước tiếp theo.",
    };
  };

  const openAuthModal = (mode: AuthMode = "login") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => setShowAuthModal(false);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      isInstructor: user?.role === "instructor" || user?.role === "admin",
      isLoading,
      login,
      register,
      forgotPassword,
      loginWithGoogleIdToken,
      loginWithFacebookAccessToken,
      logout,
      updateUser,
      applyAsInstructor,
      showAuthModal,
      authMode,
      openAuthModal,
      closeAuthModal,
    }),
    [user, isLoading, showAuthModal, authMode],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
