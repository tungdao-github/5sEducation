"use client";

import { BookOpen, Heart } from "lucide-react";
import { useI18n } from "@/app/providers";
import { Link } from "@/lib/router";
import { useWishlist } from "@/contexts/WishlistContext";
import { formatPrice } from "@/services/api";
import { toast } from "@/lib/notify";

export default function AccountWishlistTab() {
  const { tx } = useI18n();
  const { wishlistItems, removeFromWishlist } = useWishlist();

  return (
    <div>
      <h2 className="mb-5 text-lg font-semibold text-gray-900">{tx("Wishlisted courses", "Khóa học yêu thích")}</h2>
      {wishlistItems.length === 0 ? (
        <div className="py-12 text-center">
          <Heart className="mx-auto mb-3 size-12 text-gray-200" />
          <p className="text-sm text-gray-500">{tx("No saved courses yet", "Chưa có khóa học yêu thích")}</p>
          <Link to="/" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
            {tx("Discover courses", "Khám phá ngay")}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {wishlistItems.map((course) => (
            <div key={course.id} className="flex items-center gap-4 rounded-xl border border-gray-100 p-3 transition-colors hover:border-blue-200">
              <Link to={`/course/${course.slug ?? course.id}`} className="flex-shrink-0">
                <img src={course.image} alt={course.title} className="h-14 w-20 rounded-lg object-cover" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={`/course/${course.slug ?? course.id}`}>
                  <h3 className="line-clamp-1 text-sm font-semibold text-gray-900 transition-colors hover:text-blue-600">{course.title}</h3>
                </Link>
                <p className="mt-0.5 text-xs text-gray-500">{course.instructor}</p>
                <p className="mt-1 text-sm font-bold text-blue-600">{formatPrice(course.price)}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  to={`/course/${course.slug ?? course.id}`}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-center text-xs text-white transition-colors hover:bg-blue-700"
                >
                  <BookOpen className="mr-1 inline size-3.5" />
                  {tx("Open", "Xem")}
                </Link>
                <button
                  onClick={() => {
                    removeFromWishlist(course.id);
                    toast(tx("Removed from wishlist.", "Đã xóa khỏi yêu thích"), { icon: "💔" });
                  }}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-50"
                >
                  {tx("Remove", "Xóa")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
