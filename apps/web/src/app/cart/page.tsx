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

interface OrderItem {
  id: number;
  courseId: number;
  courseTitle: string;
  courseSlug: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

interface Order {
  id: number;
  status: string;
  subtotal: number;
  discountTotal: number;
  total: number;
  currency: string;
  createdAt: string;
  items: OrderItem[];
}

export default function CartPage() {
  const { tx } = useI18n();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutSummary, setCheckoutSummary] = useState<CartItem[]>([]);
  const [checkoutOrder, setCheckoutOrder] = useState<Order | null>(null);
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
      let order: Order | null = null;
      try {
        order = (await res.json()) as Order;
      } catch {
        order = null;
      }
      setItems([]);
      setCheckoutSummary(snapshot);
      setCheckoutOrder(order);
      setCheckoutSuccess(true);
    } else {
      setCheckoutSuccess(false);
      setCheckoutOrder(null);
      const message = await res.text().catch(() => "");
      setCheckoutError(message || tx("Checkout failed. Please try again.", "Thanh toan that bai. Vui long thu lai."));
    }

    setLoading(false);
  };

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{tx("Your cart", "Gio hang cua ban")}</h1>

        {needsAuth ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">{tx("Please sign in to view your cart.", "Vui long dang nhap de xem gio hang.")}</p>
            <Link
              href="/login?next=/cart"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {tx("Sign in", "Dang nhap")}
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="min-h-[50vh] flex items-center justify-center">
            {checkoutSuccess ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-xl w-full">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{tx("Order successful!", "Dat hang thanh cong!")}</h2>
                {checkoutOrder && (
                  <p className="text-sm text-gray-500 mb-2">
                    {tx("Order", "Don hang")} #{checkoutOrder.id} · {checkoutOrder.currency} {checkoutOrder.total.toFixed(2)}
                  </p>
                )}
                <p className="text-gray-600 mb-6">
                  {tx("Your courses are now available in My Learning.", "Khoa hoc da co trong trang Hoc tap cua ban.")}
                </p>
                {checkoutSummary.length > 0 && (
                  <div className="grid gap-3 md:grid-cols-2 mb-6">
                    {checkoutSummary.map((item) => (
                      <div key={item.courseId} className="bg-gray-50 rounded-lg p-3 text-left">
                        <p className="text-sm font-semibold text-gray-900">{item.courseTitle}</p>
                        <p className="text-xs text-gray-500">${item.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    href="/dashboard"
                    className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white"
                  >
                    {tx("Go to My Learning", "Den trang Hoc tap")}
                  </Link>
                  <Link
                    href="/orders"
                    className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700"
                  >
                    {tx("View orders", "Xem don hang")}
                  </Link>
                  <Link
                    href="/courses"
                    className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700"
                  >
                    {tx("Browse more courses", "Xem them khoa hoc")}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center max-w-md">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{tx("Your cart is empty", "Gio hang trong")}</h2>
                <p className="text-gray-600 mb-6">
                  {tx("Add courses to your cart to get started.", "Hay them khoa hoc vao gio hang de bat dau.")}
                </p>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  {tx("Explore courses", "Kham pha khoa hoc")}
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="flex flex-col sm:flex-row gap-4 p-4">
                    <Link href={`/courses/${item.courseSlug}`} className="flex-shrink-0">
                      <img
                        src={resolveApiAsset(item.thumbnailUrl) || "/images/learning.jpg"}
                        alt={item.courseTitle}
                        className="w-full sm:w-48 aspect-video object-cover rounded-lg"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/courses/${item.courseSlug}`}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                          {item.courseTitle}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 mb-2">{tx("Qty", "So luong")}: {item.quantity}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-blue-600">${item.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start">
                      <button
                        onClick={() => handleRemove(item.courseId)}
                        className="text-red-600 hover:text-red-700 transition-colors px-3 py-1 text-sm"
                      >
                        {tx("Remove", "Xoa")}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
                <h2 className="text-xl font-bold text-gray-900 mb-6">{tx("Order summary", "Tong quan")}</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>{tx("Subtotal", "Tam tinh")}</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>{tx("Tax", "Thue")}</span>
                    <span>$0</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>{tx("Total", "Tong")}</span>
                    <span className="text-blue-600">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {checkoutError && (
                  <p className="mb-4 text-sm text-red-600">{checkoutError}</p>
                )}

                <button
                  type="button"
                  onClick={handleCheckout}
                  className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-3"
                  disabled={loading}
                >
                  {loading ? tx("Processing...", "Dang xu ly...") : tx("Checkout", "Thanh toan")}
                </button>

                <Link
                  href="/courses"
                  className="block w-full bg-gray-100 text-gray-700 text-center py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  {tx("Continue browsing", "Tiep tuc mua")}
                </Link>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">{tx("Your benefits", "Quyen loi")}</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2"><span className="text-green-600">•</span>{tx("Lifetime access", "Truy cap tron doi")}</li>
                    <li className="flex items-start gap-2"><span className="text-green-600">•</span>{tx("Completion certificate", "Chung chi hoan thanh")}</li>
                    <li className="flex items-start gap-2"><span className="text-green-600">•</span>{tx("Free updates", "Cap nhat mien phi")}</li>
                    <li className="flex items-start gap-2"><span className="text-green-600">•</span>{tx("30-day refund", "Hoan tien 30 ngay")}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
