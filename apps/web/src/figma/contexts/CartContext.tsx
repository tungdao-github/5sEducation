import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { fetchCartItems, fetchCoursesByIds, mapCourseCompare } from "../data/api";
import type { CartItemDto, OrderDto } from "../data/api";
import { fetchJsonWithAuth, resolveApiAsset } from "@/lib/api";
import { useAuth } from "./AuthContext";
import { useLanguage } from "./LanguageContext";

export interface Course {
  id: string;
  slug?: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  instructor: string;
  instructorAvatar?: string;
  duration: string;
  quantity?: number;
  level: string;
  language?: string;
  lessons: number;
  students: number;
  rating: number;
  category: string;
  categorySlug?: string;
  description: string;
  learningOutcomes: string[];
  requirements?: string[];
  previewVideoUrl?: string;
  curriculum: {
    title: string;
    lessons: number;
    duration: string;
    items?: { title: string; durationMinutes?: number }[];
  }[];
}

interface CartContextType {
  cartItems: Course[];
  addToCart: (course: Course) => Promise<void> | void;
  removeFromCart: (courseId: string) => Promise<void> | void;
  clearCart: () => Promise<void> | void;
  checkout: (couponCode?: string) => Promise<OrderDto | null>;
  isInCart: (courseId: string) => boolean;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const GUEST_CART_KEY = "guest_cart";

function readGuestCart(): Course[] {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(GUEST_CART_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as Course[];
  } catch {
    window.localStorage.removeItem(GUEST_CART_KEY);
    return [];
  }
}

function saveGuestCart(items: Course[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

function fallbackCourseFromItem(item: CartItemDto): Course {
  return {
    id: String(item.courseId),
    slug: item.courseSlug,
    title: item.courseTitle,
    price: Number(item.price),
    image: resolveApiAsset(item.thumbnailUrl),
    instructor: "Đang cập nhật",
    duration: "—",
    level: "—",
    lessons: 0,
    students: 0,
    rating: 0,
    category: "Khác",
    description: "",
    learningOutcomes: [],
    curriculum: [],
    quantity: item.quantity,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [cartItems, setCartItems] = useState<Course[]>([]);

  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems(readGuestCart());
      return;
    }

    try {
      const items = await fetchCartItems();
      if (items.length === 0) {
        setCartItems([]);
        return;
      }

      const ids = items.map((item) => item.courseId);
      const compareDtos = await fetchCoursesByIds(ids);
      const courseMap = new Map(
        compareDtos.map((dto) => [dto.id, mapCourseCompare(dto, language)])
      );

      const mapped = items.map((item) => {
        const base = courseMap.get(item.courseId);
        if (!base) return fallbackCourseFromItem(item);
        return {
          ...base,
          id: String(item.courseId),
          price: Number(item.price),
          quantity: item.quantity,
        };
      });

      setCartItems(mapped);
    } catch (error) {
      console.error("Failed to load cart", error);
      setCartItems([]);
    }
  }, [isAuthenticated, language]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => loadCart();
    window.addEventListener("auth-changed", handler);
    return () => window.removeEventListener("auth-changed", handler);
  }, [loadCart]);

  const addToCart = async (course: Course) => {
    if (!isAuthenticated) {
      setCartItems((prev) => {
        if (prev.find((item) => item.id === course.id)) return prev;
        const next = [...prev, { ...course, quantity: 1 }];
        saveGuestCart(next);
        return next;
      });
      return;
    }

    await fetchJsonWithAuth("/api/cart", {
      method: "POST",
      body: JSON.stringify({ courseId: Number(course.id), quantity: 1 }),
    });
    await loadCart();
  };

  const removeFromCart = async (courseId: string) => {
    if (!isAuthenticated) {
      setCartItems((prev) => {
        const next = prev.filter((item) => item.id !== courseId);
        saveGuestCart(next);
        return next;
      });
      return;
    }

    await fetchJsonWithAuth(`/api/cart/${courseId}`, { method: "DELETE" });
    await loadCart();
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      saveGuestCart([]);
      return;
    }

    await Promise.all(
      cartItems.map((item) =>
        fetchJsonWithAuth(`/api/cart/${item.id}`, { method: "DELETE" })
      )
    );
    await loadCart();
  };

  const checkout = async (couponCode?: string) => {
    if (!isAuthenticated) return null;
    const order = await fetchJsonWithAuth<OrderDto>("/api/cart/checkout", {
      method: "POST",
      body: JSON.stringify({ couponCode }),
    });
    await loadCart();
    return order;
  };

  const isInCart = (courseId: string) => {
    return cartItems.some((item) => item.id === courseId);
  };

  const totalPrice = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + item.price * (item.quantity ?? 1),
        0
      ),
    [cartItems]
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        checkout,
        isInCart,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
