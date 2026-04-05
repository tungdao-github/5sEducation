"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { API_URL, resolveApiAsset } from "@/lib/api";
import { useI18n } from "@/app/providers";

interface WishlistItem {
  id: number;
  courseId: number;
  courseTitle: string;
  courseSlug: string;
  thumbnailUrl: string;
  price: number;
  level: string;
  language: string;
}

export default function WishlistPage() {
  const { tx } = useI18n();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const loadWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    const res = await fetch(`${API_URL}/api/wishlist`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setItems(await res.json());
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (courseId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    await fetch(`${API_URL}/api/wishlist/${courseId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    setItems((prev) => prev.filter((item) => item.courseId !== courseId));
  };

  const handleAddToCart = async (courseId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoadingId(courseId);
    await fetch(`${API_URL}/api/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ courseId, quantity: 1 }),
    });
    setLoadingId(null);
  };

  const totalValue = useMemo(
    () => items.reduce((sum, item) => sum + item.price, 0),
    [items]
  );

  if (needsAuth) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{tx("Sign in required", "Can dang nhap")}</h2>
          <p className="text-gray-500 mb-6">{tx("Please sign in to view your wishlist.", "Vui long dang nhap de xem danh sach yeu thich.")}</p>
          <Link
            href="/login?next=/wishlist"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {tx("Sign in", "Dang nhap")}
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="size-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">?</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{tx("No saved courses", "Chua co khoa hoc yeu thich")}</h2>
          <p className="text-gray-500 mb-6">{tx("Save courses to revisit later.", "Hay them khoa hoc de xem lai sau.")}</p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {tx("Explore courses", "Kham pha khoa hoc")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="size-6 text-red-500">?</span>
          <h1 className="text-3xl font-bold text-gray-900">{tx("Wishlist", "Khoa hoc yeu thich")}</h1>
          <span className="bg-gray-200 text-gray-700 px-2.5 py-0.5 rounded-full text-sm font-medium">
            {items.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4 p-4">
                <Link href={`/courses/${course.courseSlug}`} className="flex-shrink-0">
                  <img
                    src={resolveApiAsset(course.thumbnailUrl) || "/images/learning.jpg"}
                    alt={course.courseTitle}
                    className="w-28 h-20 object-cover rounded-lg"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/courses/${course.courseSlug}`}>
                    <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 text-sm">
                      {course.courseTitle}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    {course.level && <span className="bg-gray-100 px-2 py-1 rounded-full">{course.level}</span>}
                    {course.language && <span className="bg-gray-100 px-2 py-1 rounded-full">{course.language}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold text-blue-600">${course.price.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleAddToCart(course.courseId)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
                      disabled={loadingId === course.courseId}
                    >
                      {loadingId === course.courseId ? tx("Adding...", "Dang them...") : tx("Add to cart", "Them vao gio")}
                    </button>
                    <button
                      onClick={() => handleRemove(course.courseId)}
                      className="p-1.5 text-gray-400 hover:text-red-500 border border-gray-200 rounded-lg transition-colors"
                    >
                      ?
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{tx("Total value", "Tong gia tri")}</p>
            <p className="text-2xl font-bold text-gray-900">${totalValue.toFixed(2)}</p>
          </div>
          <Link
            href="/cart"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            {tx("Go to cart", "Den gio hang")}
          </Link>
        </div>
      </div>
    </div>
  );
}
