"use client";

import { Link } from "@/figma/compat/router";
import {
  Clock,
  BarChart3,
  Star,
  ShoppingCart,
  Check,
  Heart,
  Users,
  Play,
} from "lucide-react";
import type { Course } from "../contexts/CartContext";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { toast } from "@/figma/compat/sonner";
import { cn, formatPrice, formatCompactNumber } from "@/lib/utils";

interface CourseCardProps {
  course: Course;
  variant?: "default" | "compact" | "horizontal";
}

export default function CourseCard({ course, variant = "default" }: CourseCardProps) {
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const inCart = isInCart(course.id);
  const inWishlist = isInWishlist(course.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inCart) {
      addToCart(course);
      toast.success("Da them vao gio hang!");
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(course);
    if (inWishlist) {
      toast("Da xoa khoi yeu thich");
    } else {
      toast.success("Da them vao yeu thich!");
    }
  };

  const discount = course.originalPrice
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  if (variant === "horizontal") {
    return (
      <Link
        to={`/courses/${course.slug ?? course.id}`}
        className="group flex gap-4 p-4 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300"
      >
        {/* Image */}
        <div className="relative w-40 h-24 rounded-xl overflow-hidden flex-shrink-0">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 badge badge-danger text-[10px]">
              -{discount}%
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-accent uppercase tracking-wide">
            {course.category}
          </span>
          <h3 className="font-semibold text-foreground line-clamp-1 mt-1 group-hover:text-accent transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{course.instructor}</p>
          <div className="flex items-center gap-3 mt-2 text-sm">
            <span className="flex items-center gap-1">
              <Star className="size-4 star-filled" />
              <span className="font-semibold text-foreground">{course.rating}</span>
            </span>
            <span className="text-muted-foreground">
              {formatCompactNumber(course.students)} hoc vien
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold text-accent">
            {formatPrice(course.price)}
          </div>
          {course.originalPrice && (
            <div className="text-sm text-muted-foreground line-through">
              {formatPrice(course.originalPrice)}
            </div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/courses/${course.slug ?? course.id}`}
      className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="size-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg scale-90 group-hover:scale-100 transition-transform">
            <Play className="size-6 text-primary ml-1" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {discount > 0 && (
            <span className="badge bg-destructive text-destructive-foreground">
              -{discount}%
            </span>
          )}
          {course.isBestseller && (
            <span className="badge badge-warning">Bestseller</span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={cn(
            "absolute top-3 right-3 size-9 rounded-full flex items-center justify-center shadow-md transition-all",
            inWishlist
              ? "bg-destructive text-destructive-foreground"
              : "bg-white/90 text-muted-foreground hover:text-destructive hover:bg-white"
          )}
        >
          <Heart className={cn("size-4", inWishlist && "fill-current")} />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Category */}
        <span className="text-xs font-semibold text-accent uppercase tracking-wide mb-2">
          {course.category}
        </span>

        {/* Title */}
        <h3 className="text-base font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-accent transition-colors">
          {course.title}
        </h3>

        {/* Instructor */}
        <p className="text-sm text-muted-foreground mb-3">
          {course.instructor}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Star className="size-4 star-filled" />
            <span className="font-semibold text-foreground">{course.rating}</span>
            <span>({formatCompactNumber(course.students)})</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-4" />
            {course.duration}
          </span>
        </div>

        {/* Level */}
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{course.level}</span>
        </div>

        {/* Price and Action */}
        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-accent">
              {formatPrice(course.price)}
            </span>
            {course.originalPrice && (
              <span className="text-sm text-muted-foreground line-through ml-2">
                {formatPrice(course.originalPrice)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={inCart}
            className={cn(
              "btn btn-sm",
              inCart ? "btn-secondary cursor-default" : "btn-accent"
            )}
          >
            {inCart ? (
              <>
                <Check className="size-4" />
                Da them
              </>
            ) : (
              <>
                <ShoppingCart className="size-4" />
                Them
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
