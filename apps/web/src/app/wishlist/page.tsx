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
  const itemCount = items.length;

  return (
    <div className="section-shell space-y-8 py-12 fade-in">
      <div className="space-y-2">
        <Link href="/courses" className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {tx("Courses", "Khoa hoc")}
        </Link>
        <h1 className="section-title text-4xl font-semibold text-emerald-950">
          {tx("Wishlist", "Danh sach yeu thich")}
        </h1>
        <p className="text-sm text-emerald-800/70">
          {tx("Save courses to revisit later.", "Luu khoa hoc de xem lai sau.")}
        </p>
        <div className="flex flex-wrap gap-3 text-sm text-emerald-800/70">
          <div className="stat-pill">
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-emerald-700">
              {tx("Saved", "Da luu")}
            </span>
            <span className="text-sm font-semibold text-emerald-950">{itemCount}</span>
          </div>
          <div className="stat-pill">
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-emerald-700">
              {tx("Value", "Gia tri")}
            </span>
            <span className="text-sm font-semibold text-emerald-950">${totalValue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {needsAuth ? (
        <div className="surface-card p-10 text-center">
          <p className="text-sm text-emerald-800/70">
            {tx("Please sign in to view your wishlist.", "Vui long dang nhap de xem danh sach yeu thich.")}
          </p>
          <Link
            href="/login?next=/wishlist"
            className="mt-4 inline-flex rounded-full bg-emerald-700 px-6 py-2 text-sm font-semibold text-white"
          >
            {tx("Sign in", "Dang nhap")}
          </Link>
        </div>
      ) : items.length === 0 ? (
        <div className="surface-card p-10 text-center text-sm text-emerald-800/70">
          {tx("Your wishlist is empty.", "Danh sach yeu thich dang trong.")}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            <div className="surface-card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  {tx("Saved courses", "Khoa hoc da luu")}
                </p>
                <p className="text-sm text-emerald-800/70">
                  {tx("Pick what to learn next or move to cart.", "Chon khoa hoc tiep theo hoac dua vao gio hang.")}
                </p>
              </div>
              <span className="text-sm font-semibold text-emerald-950">
                {itemCount} {tx("items", "khoa hoc")}
              </span>
            </div>
            {items.map((item) => (
              <div key={item.id} className="surface-card flex flex-col gap-4 p-4 md:flex-row">
                <img
                  src={resolveApiAsset(item.thumbnailUrl) || "/images/learning.jpg"}
                  alt={item.courseTitle}
                  className="h-28 w-full rounded-2xl object-cover md:h-24 md:w-40"
                />
                <div className="flex flex-1 flex-col justify-between gap-2">
                  <div>
                    <Link href={`/courses/${item.courseSlug}`} className="text-lg font-semibold text-emerald-950">
                      {item.courseTitle}
                    </Link>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-emerald-800/70">
                      {item.level && <span className="badge">{item.level}</span>}
                      {item.language && <span className="badge">{item.language}</span>}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item.courseId)}
                      className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white"
                    >
                      {loadingId === item.courseId
                        ? tx("Adding...", "Dang them...")
                        : tx("Add to cart", "Them vao gio")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.courseId)}
                      className="rounded-full border border-[color:var(--stroke)] px-3 py-2 text-xs font-semibold text-emerald-900"
                    >
                      {tx("Remove", "Xoa")}
                    </button>
                  </div>
                </div>
                <div className="text-sm font-semibold text-emerald-950">${item.price.toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="surface-card h-fit space-y-4 p-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                {tx("Wishlist value", "Tong gia tri")}
              </p>
              <p className="text-3xl font-semibold text-emerald-950">${totalValue.toFixed(2)}</p>
              <p className="text-xs text-emerald-800/70">
                {tx("Includes", "Bao gom")} {itemCount} {tx("items", "khoa hoc")}
              </p>
            </div>
            <Link
              href="/cart"
              className="mt-6 inline-flex w-full justify-center rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white"
            >
              {tx("Go to cart", "Den gio hang")}
            </Link>
            <Link
              href="/courses"
              className="inline-flex w-full justify-center rounded-full border border-[color:var(--stroke)] px-6 py-2 text-xs font-semibold text-emerald-900"
            >
              {tx("Continue browsing", "Tiep tuc xem khoa hoc")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

