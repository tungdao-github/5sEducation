"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addCourseToCart, addCourseToWishlist, enrollInCourse } from "@/services/api";
import { notify } from "@/lib/notify";
import { useI18n } from "@/app/providers";

export function CourseActions({
  courseId,
  courseSlug,
}: {
  courseId: number;
  courseSlug: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"cart" | "wishlist" | "enroll" | null>(
    null,
  );
  const { tx } = useI18n();

  const requireAuth = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      notify({
        title: tx("Sign in required", "Can dang nhap"),
        message: tx(
          "Please sign in to continue.",
          "Vui long dang nhap de tiep tuc.",
        ),
      });
      router.push(`/?auth=login&next=${encodeURIComponent(`/courses/${courseSlug}`)}`);
      return null;
    }
    return token;
  };

  const addToCart = async () => {
    const token = requireAuth();
    if (!token) return;

    try {
      setLoading("cart");
      await addCourseToCart(courseId, 1);

      notify({
        title: tx("Added to cart", "Da them vao gio"),
        message: tx(
          "Course added to your cart.",
          "Khoa hoc da duoc them vao gio hang.",
        ),
      });
    } catch {
      notify({
        title: tx("Could not add to cart", "Khong the them vao gio"),
        message: tx("Please try again in a moment.", "Vui long thu lai sau."),
      });
    } finally {
      setLoading(null);
    }
  };

  const enrollNow = async () => {
    const token = requireAuth();
    if (!token) return;

    try {
      setLoading("enroll");
      await enrollInCourse(courseId);

      notify({
        title: tx("Enrollment confirmed", "Dang ky thanh cong"),
        message: tx(
          "You can now access this course.",
          "Ban co the vao hoc ngay bay gio.",
        ),
      });
      router.push(`/learn/${courseSlug}`);
    } catch {
      notify({
        title: tx("Enrollment failed", "Dang ky that bai"),
        message: tx("Please try again in a moment.", "Vui long thu lai sau."),
      });
    } finally {
      setLoading(null);
    }
  };

  const saveWishlist = async () => {
    const token = requireAuth();
    if (!token) return;

    try {
      setLoading("wishlist");
      await addCourseToWishlist(courseId);

      notify({
        title: tx("Saved to wishlist", "Da luu yeu thich"),
        message: tx("Course saved for later.", "Khoa hoc da duoc luu lai."),
      });
    } catch {
      notify({
        title: tx("Could not save", "Khong the luu"),
        message: tx("Please try again in a moment.", "Vui long thu lai sau."),
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mt-6 flex flex-col gap-3">
      <button
        type="button"
        onClick={addToCart}
        disabled={loading !== null}
        className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading === "cart"
          ? tx("Adding...", "Dang them...")
          : tx("Add to cart", "Them vao gio")}
      </button>
      <button
        type="button"
        onClick={saveWishlist}
        disabled={loading !== null}
        className="rounded-lg border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading === "wishlist"
          ? tx("Saving...", "Dang luu...")
          : tx("Save to wishlist", "Luu yeu thich")}
      </button>
      <button
        type="button"
        onClick={enrollNow}
        disabled={loading !== null}
        className="rounded-lg border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading === "enroll"
          ? tx("Enrolling...", "Dang dang ky...")
          : tx("Enroll now", "Dang ky ngay")}
      </button>
    </div>
  );
}

