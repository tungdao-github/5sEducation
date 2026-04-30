"use client";

import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "@/lib/notify";
import type { Course } from "@/contexts/CartContext";

export function useWishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();

  const handleAddToCart = (course: Course) => {
    if (!isInCart(course.id)) {
      addToCart(course);
      toast.success("Đã thêm vào giỏ hàng!");
    }
  };

  const handleRemove = (courseId: string) => {
    removeFromWishlist(courseId);
    toast("Đã xóa khỏi yêu thích", { icon: "💔" });
  };

  return {
    wishlistItems,
    isInCart,
    handleAddToCart,
    handleRemove,
  } as const;
}
