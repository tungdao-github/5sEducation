"use client";

import { useCart } from "@/contexts/CartContext";
import { ShoppingBag } from "lucide-react";
import CartEmptyState from "@/components/cart/CartEmptyState";
import CartCourseItem from "@/components/cart/CartCourseItem";
import CartSummaryPanel from "@/components/cart/CartSummaryPanel";

const IMAGE_FALLBACK = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <rect width="100%" height="100%" fill="#f8fafc"/>
    <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" fill="#94a3b8" font-family="Arial, Helvetica, sans-serif" font-size="42">EduCourse</text>
  </svg>`
)}`;

function safeImage(src?: string | null) {
  return src && src.trim().length > 0 ? src : IMAGE_FALLBACK;
}

export default function Cart() {
  const { cartItems, removeFromCart, totalPrice } = useCart();

  if (cartItems.length === 0) {
    return <CartEmptyState />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ShoppingBag className="size-5" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950">Giỏ hàng của bạn</h1>
            <p className="text-sm text-slate-500">{cartItems.length} khóa học sẵn sàng để thanh toán</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {cartItems.map((course) => (
              <CartCourseItem key={course.id} course={course} onRemove={removeFromCart} safeImage={safeImage} />
            ))}
          </div>

          <CartSummaryPanel totalPrice={totalPrice} />
        </div>
      </div>
    </div>
  );
}
