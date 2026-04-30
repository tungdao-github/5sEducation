"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchCurrentUser } from "@/services/api";
import { getStoredToken } from "@/lib/api";

export type HeaderUserProfile = Awaited<ReturnType<typeof fetchCurrentUser>>;

export function useHeaderAccount() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [user, setUser] = useState<HeaderUserProfile | null>(null);
  const profileRequestId = useRef(0);
  const mountedRef = useRef(true);

  const isInstructor = useMemo(
    () => Boolean(user?.roles?.some((role) => String(role).toLowerCase() === "instructor")),
    [user]
  );

  const loadProfile = useCallback(async () => {
    const requestId = ++profileRequestId.current;
    try {
      if (requestId !== profileRequestId.current || !mountedRef.current) {
        return;
      }
      const data = await fetchCurrentUser();
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
    loadProfile();
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
