"use client";

import { Link } from "@/figma/compat/router";
import { Clock, BarChart3, Star, ShoppingCart, Check, Heart } from "lucide-react";
import { Course } from "../contexts/CartContext";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { toast } from "@/figma/compat/sonner";
import { formatPrice } from "../data/api";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const inCart = isInCart(course.id);
  const inWishlist = isInWishlist(course.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inCart) {
      addToCart(course);
      toast.success("Đã thêm vào giỏ hàng!");
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(course);
    if (inWishlist) {
      toast("Đã xóa khỏi yêu thích", { icon: "💔" });
    } else {
      toast.success("Đã thêm vào yêu thích!");
    }
  };

  const discount = course.originalPrice
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  return (
    <Link
      to={`/course/${course.slug ?? course.id}`}
      className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-video flex-shrink-0">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-0.5 rounded-full text-xs font-bold">
            -{discount}%
          </div>
        )}
        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 size-8 rounded-full flex items-center justify-center shadow-md transition-all ${
            inWishlist
              ? "bg-red-500 text-white"
              : "bg-white/90 text-gray-500 hover:bg-red-50 hover:text-red-500"
          }`}
        >
          <Heart className={`size-4 ${inWishlist ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category */}
        <div className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1.5">
          {course.category}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors flex-1">
          {course.title}
        </h3>

        {/* Instructor */}
        <p className="text-xs text-gray-500 mb-2">
          Giảng viên: <span className="text-gray-700 font-medium">{course.instructor}</span>
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-gray-800">{course.rating}</span>
            <span>({course.students.toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="size-3.5" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="size-3.5" />
            <span className="truncate max-w-[80px]">{course.level}</span>
          </div>
        </div>

        {/* Price and Action */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-blue-600">{formatPrice(course.price)}</span>
            {course.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(course.originalPrice)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={inCart}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              inCart
                ? "bg-green-100 text-green-700 cursor-default"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {inCart ? (
              <>
                <Check className="size-3.5" />
                Đã thêm
              </>
            ) : (
              <>
                <ShoppingCart className="size-3.5" />
                Thêm giỏ
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
