import Link from "next/link";
import type { MouseEvent } from "react";
import { useCart, type Course } from "@/figma/contexts/CartContext";
import { useWishlist } from "@/figma/contexts/WishlistContext";
import { toast } from "@/figma/compat/sonner";
import { Clock, BarChart3, Star, ShoppingCart, Check, Heart } from "lucide-react";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const inCart = isInCart(course.id);
  const inWishlist = isInWishlist(course.id);

  const handleAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!inCart) {
      void addToCart(course);
      toast.success("Đã thêm vào giỏ hàng!");
    }
  };

  const handleWishlist = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    void toggleWishlist(course);
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
      href={`/courses/${course.slug ?? course.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:shadow-xl"
    >
      <div className="relative aspect-video shrink-0 overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {discount > 0 && (
          <div className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white">
            -{discount}%
          </div>
        )}
        <button
          type="button"
          onClick={handleWishlist}
          className={`absolute right-3 top-3 flex size-8 items-center justify-center rounded-full shadow-md transition-all ${
            inWishlist
              ? "bg-red-500 text-white"
              : "bg-white/90 text-gray-500 hover:bg-red-50 hover:text-red-500"
          }`}
        >
          <Heart className={`size-4 ${inWishlist ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-blue-600">
          {course.category}
        </div>

        <h3 className="mb-2 line-clamp-2 flex-1 text-sm font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
          {course.title}
        </h3>

        <p className="mb-2 text-xs text-gray-500">
          Giảng viên: <span className="font-medium text-gray-700">{course.instructor}</span>
        </p>

        <div className="mb-3 flex items-center gap-3 text-xs text-gray-500">
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
            <span className="max-w-[60px] truncate">{course.level.split(" ")[0]}</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-blue-600">
              {`${course.price.toLocaleString("vi-VN")}K₫`}
            </span>
            {course.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                {`${course.originalPrice.toLocaleString("vi-VN")}K₫`}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={inCart}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              inCart
                ? "cursor-default bg-green-100 text-green-700"
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
