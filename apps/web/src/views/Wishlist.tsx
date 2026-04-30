"use client";

import { formatPrice } from "@/services/api";
import WishlistEmptyState from "@/components/wishlist/WishlistEmptyState";
import WishlistHeader from "@/components/wishlist/WishlistHeader";
import WishlistCourseCard from "@/components/wishlist/WishlistCourseCard";
import { useWishlistPage } from "@/components/wishlist/useWishlistPage";

const IMAGE_FALLBACK = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <rect width="100%" height="100%" fill="#f1f5f9"/>
    <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" fill="#94a3b8" font-family="Arial, Helvetica, sans-serif" font-size="42">EduCourse</text>
  </svg>`
)}`;

function safeImage(src?: string | null) {
  return src && src.trim().length > 0 ? src : IMAGE_FALLBACK;
}

export default function Wishlist() {
  const { wishlistItems, isInCart, handleAddToCart, handleRemove } = useWishlistPage();

  if (wishlistItems.length === 0) {
    return <WishlistEmptyState />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <WishlistHeader count={wishlistItems.length} />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {wishlistItems.map((course) => (
            <WishlistCourseCard
              key={course.id}
              course={course}
              inCart={isInCart(course.id)}
              onAddToCart={handleAddToCart}
              onRemove={handleRemove}
              safeImage={safeImage}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
