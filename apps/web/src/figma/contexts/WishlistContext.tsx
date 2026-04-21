"use client";

import { createContext, useContext, useEffect, useCallback, useState, type ReactNode } from "react";
import type { Course } from "./CartContext";
import { useAuth } from "./AuthContext";
import { useLanguage } from "./LanguageContext";
import { fetchWishlistItems, fetchCoursesByIds, mapCourseCompare } from "../data/api";
import type { WishlistItemDto } from "../data/api";
import { fetchJsonWithAuth, getStoredToken, resolveApiAsset } from "@/lib/api";

interface WishlistContextType {
  wishlistItems: Course[];
  addToWishlist: (course: Course) => Promise<void> | void;
  removeFromWishlist: (courseId: string) => Promise<void> | void;
  isInWishlist: (courseId: string) => boolean;
  toggleWishlist: (course: Course) => Promise<void> | void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const GUEST_WISHLIST_KEY = "guest_wishlist";

function readGuestWishlist(): Course[] {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(GUEST_WISHLIST_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored) as Course[];
  } catch {
    window.localStorage.removeItem(GUEST_WISHLIST_KEY);
    return [];
  }
}

function saveGuestWishlist(items: Course[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(items));
}

function fallbackCourseFromItem(item: WishlistItemDto): Course {
  return {
    id: String(item.courseId),
    slug: item.courseSlug,
    title: item.courseTitle,
    price: Number(item.price),
    image: resolveApiAsset(item.thumbnailUrl),
    instructor: item.instructorName?.trim() || "Dang cap nhat",
    instructorAvatar: item.instructorAvatarUrl ?? undefined,
    duration: "Dang cap nhat",
    level: item.level || "Dang cap nhat",
    lessons: 0,
    students: 0,
    rating: 0,
    category: "Khac",
    description: "",
    learningOutcomes: [],
    curriculum: [],
  };
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [wishlistItems, setWishlistItems] = useState<Course[]>([]);

  const loadWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistItems(readGuestWishlist());
      return;
    }

    try {
      const items = await fetchWishlistItems();
      if (items.length === 0) {
        setWishlistItems([]);
        return;
      }

      const ids = items.map((item) => item.courseId);
      const compareDtos = await fetchCoursesByIds(ids);
      const courseMap = new Map(compareDtos.map((dto) => [dto.id, mapCourseCompare(dto, language)]));
      const mapped = items.map((item) => {
        const base = courseMap.get(item.courseId);
        if (!base) return fallbackCourseFromItem(item);

        return {
          ...base,
          id: String(item.courseId),
          price: Number(item.price),
        };
      });

      setWishlistItems(mapped);
    } catch (error) {
      if (!getStoredToken()) {
        setWishlistItems(readGuestWishlist());
        return;
      }
      console.error("Failed to load wishlist", error);
      setWishlistItems([]);
    }
  }, [isAuthenticated, language]);

  useEffect(() => {
    void loadWishlist();
  }, [loadWishlist]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = () => {
      void loadWishlist();
    };

    window.addEventListener("auth-changed", handler);
    return () => window.removeEventListener("auth-changed", handler);
  }, [loadWishlist]);

  const saveGuest = (items: Course[]) => {
    setWishlistItems(items);
    saveGuestWishlist(items);
  };

  const addToWishlist = async (course: Course) => {
    if (!isAuthenticated) {
      if (!wishlistItems.find((item) => item.id === course.id)) {
        saveGuest([...wishlistItems, course]);
      }
      return;
    }

    await fetchJsonWithAuth("/api/wishlist", {
      method: "POST",
      body: JSON.stringify({ courseId: Number(course.id) }),
    });
    await loadWishlist();
  };

  const removeFromWishlist = async (courseId: string) => {
    if (!isAuthenticated) {
      saveGuest(wishlistItems.filter((item) => item.id !== courseId));
      return;
    }

    await fetchJsonWithAuth(`/api/wishlist/${courseId}`, { method: "DELETE" });
    await loadWishlist();
  };

  const isInWishlist = (courseId: string) => wishlistItems.some((item) => item.id === courseId);

  const toggleWishlist = async (course: Course) => {
    if (isInWishlist(course.id)) {
      await removeFromWishlist(course.id);
      return;
    }

    await addToWishlist(course);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
}
