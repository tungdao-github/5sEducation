"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { API_URL, getStoredToken } from "@/lib/api";

export type HeaderUserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  isAdmin: boolean;
  roles?: string[];
  loyaltyPoints?: number;
  loyaltyTier?: string | null;
  instructorStatus?: "pending" | "approved" | "rejected";
};

export function useHeaderAccount() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [user, setUser] = useState<HeaderUserProfile | null>(null);
  const profileRequestId = useRef(0);
  const mountedRef = useRef(true);

  const isInstructor = useMemo(
    () => Boolean(user?.roles?.some((role) => String(role).toLowerCase() === "instructor")),
    [user]
  );

  const loadProfile = useCallback(async (token: string) => {
    const requestId = ++profileRequestId.current;
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (requestId !== profileRequestId.current || !mountedRef.current) {
        return;
      }
      if (!res.ok) {
        setUser(null);
        setIsAuthed(false);
        return;
      }
      const data = (await res.json()) as HeaderUserProfile;
      if (requestId !== profileRequestId.current || !mountedRef.current) {
        return;
      }
      setUser(data);
      setIsAuthed(true);
    } catch {
      if (requestId === profileRequestId.current && mountedRef.current) {
        setUser(null);
        setIsAuthed(false);
      }
    }
  }, []);

  const syncAuth = useCallback(() => {
    const token = getStoredToken();
    const authed = Boolean(token);
    setIsAuthed(authed);
    if (!authed) {
      profileRequestId.current += 1;
      setUser(null);
      return;
    }
    if (token) {
      loadProfile(token);
    }
  }, [loadProfile]);

  useEffect(() => {
    mountedRef.current = true;
    syncAuth();

    window.addEventListener("storage", syncAuth);
    window.addEventListener("auth-changed", syncAuth);
    return () => {
      mountedRef.current = false;
      profileRequestId.current += 1;
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("auth-changed", syncAuth);
    };
  }, [syncAuth]);

  return {
    isAuthed,
    isInstructor,
    user,
    refreshAuth: syncAuth,
  };
}
