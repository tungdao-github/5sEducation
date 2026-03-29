"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { API_URL, resolveApiAsset } from "@/lib/api";
import { useI18n } from "@/app/providers";

interface CartItem {
  id: number;
  courseId: number;
  courseTitle: string;
  courseSlug: string;
  thumbnailUrl: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  const { tx } = useI18n();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutSummary, setCheckoutSummary] = useState<CartItem[]>([]);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const loadCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    const res = await fetch(`${API_URL}/api/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setItems(await res.json());
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleRemove = async (courseId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    await fetch(`${API_URL}/api/cart/${courseId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    setItems((prev) => prev.filter((item) => item.courseId !== courseId));
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (items.length === 0) {
      setCheckoutError(tx("Your cart is empty.", "Gio hang dang trong."));
      return;
    }

    setCheckoutError(null);
    setLoading(true);
    const snapshot = items;
    const res = await fetch(`${API_URL}/api/cart/checkout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setItems([]);
      setCheckoutSummary(snapshot);
      setCheckoutSuccess(true);
    } else {
      setCheckoutSuccess(false);
      const message = await res.text().catch(() => "");
      setCheckoutError(message || tx("Checkout failed. Please try again.", "Thanh toan that bai. Vui long thu lai."));
    }

    setLoading(false);
  };

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-6 py-12 fade-in">
      <div className="space-y-2">
        <Link href="/courses" className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {tx("Courses", "Khoa hoc")}
        </Link>
        <h1 className="section-title text-4xl font-semibold text-emerald-950">
          {tx("Your cart", "Gio hang")}
        </h1>
        <p className="text-sm text-emerald-800/70">
          {tx("Review your selected courses.", "Kiem tra cac khoa hoc da chon.")}
        </p>
      </div>

      {needsAuth ? (
        <div className="glass-card rounded-3xl p-10 text-center">
          <p className="text-sm text-emerald-800/70">
            {tx("Please sign in to view your cart.", "Vui long dang nhap de xem gio hang.")}
          </p>
          <Link
            href="/login?next=/cart"
            className="mt-4 inline-flex rounded-full bg-emerald-700 px-6 py-2 text-sm font-semibold text-white"
          >
            {tx("Sign in", "Dang nhap")}
          </Link>
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card rounded-3xl p-10 text-center text-sm text-emerald-800/70">
          {checkoutSuccess ? (
            <div className="space-y-4">
              <p className="text-sm text-emerald-900">
                {tx("Order successful!", "Dat hang thanh cong!")}
              </p>
              <p className="text-xs text-emerald-800/70">
                {tx(
                  "Your courses are now available in My Learning.",
                  "Khoa hoc da co trong trang Hoc tap cua ban."
                )}
              </p>
              {checkoutSummary.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2">
                  {checkoutSummary.map((item) => (
                    <div key={item.courseId} className="rounded-2xl border border-emerald-100 bg-white/70 p-3 text-left">
                      <p className="text-xs font-semibold text-emerald-950">{item.courseTitle}</p>
                      <p className="text-[11px] text-emerald-800/70">${item.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/dashboard"
                  className="rounded-full bg-emerald-700 px-5 py-2 text-xs font-semibold text-white"
                >
                  {tx("Go to My Learning", "Den trang Hoc tap")}
                </Link>
                <Link
                  href="/orders"
                  className="rounded-full border border-emerald-200 px-5 py-2 text-xs font-semibold text-emerald-900"
                >
                  {tx("View orders", "Xem don hang")}
                </Link>
                <Link
                  href="/courses"
                  className="rounded-full border border-emerald-200 px-5 py-2 text-xs font-semibold text-emerald-900"
                >
                  {tx("Browse more courses", "Xem them khoa hoc")}
                </Link>
              </div>
            </div>
          ) : (
            tx("Your cart is empty.", "Gio hang dang trong.")
          )}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="glass-card flex flex-col gap-4 rounded-3xl p-4 md:flex-row">
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
                    <p className="text-xs text-emerald-800/70">
                      {tx("Qty", "So luong")}: {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-emerald-950">${item.price.toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.courseId)}
                      className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-900"
                    >
                      {tx("Remove", "Xoa")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card h-fit rounded-3xl p-6">
            <p className="text-sm text-emerald-800/70">{tx("Total", "Tong")}</p>
            <p className="text-3xl font-semibold text-emerald-950">${totalPrice.toFixed(2)}</p>
            {checkoutError && (
              <p className="mt-3 text-xs text-rose-600">{checkoutError}</p>
            )}
            <button
              type="button"
              onClick={handleCheckout}
              className="mt-6 w-full rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white"
            >
              {loading ? tx("Processing...", "Dang xu ly...") : tx("Checkout", "Thanh toan")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
