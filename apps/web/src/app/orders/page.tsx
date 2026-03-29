"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import { useI18n } from "@/app/providers";

type OrderItem = {
  id: number;
  courseId: number;
  courseTitle: string;
  courseSlug: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

type Order = {
  id: number;
  status: string;
  subtotal: number;
  discountTotal: number;
  total: number;
  currency: string;
  createdAt: string;
  items: OrderItem[];
};

export default function OrdersPage() {
  const { tx, locale } = useI18n();
  const [items, setItems] = useState<Order[]>([]);
  const [needsAuth, setNeedsAuth] = useState(false);

  const loadOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    const res = await fetch(`${API_URL}/api/orders/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401 || res.status === 403) {
      setNeedsAuth(true);
      return;
    }

    if (res.ok) {
      setItems(await res.json());
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  if (needsAuth) {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-16 fade-in">
        <div className="glass-card rounded-3xl p-10 text-center">
          <p className="text-sm text-emerald-800/70">
            {tx("Please sign in to view your orders.", "Vui long dang nhap de xem don hang.")}
          </p>
          <Link
            href="/login?next=/orders"
            className="mt-4 inline-flex rounded-full bg-emerald-700 px-6 py-2 text-sm font-semibold text-white"
          >
            {tx("Sign in", "Dang nhap")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-6 py-12 fade-in">
      <div className="space-y-2">
        <Link href="/dashboard" className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {tx("My learning", "Hoc tap")}
        </Link>
        <h1 className="section-title text-4xl font-semibold text-emerald-950">
          {tx("Order history", "Trang thai don hang")}
        </h1>
        <p className="text-sm text-emerald-800/70">
          {tx("Track your enrollments and order status.", "Theo doi khoa hoc va trang thai don hang.")}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="glass-card rounded-3xl p-10 text-center text-sm text-emerald-800/70">
          {tx("No orders yet.", "Chua co don hang nao.")}
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((order) => (
            <div key={order.id} className="glass-card rounded-3xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-emerald-950">
                    {tx("Order", "Don hang")} #{order.id}
                  </p>
                  <p className="text-xs text-emerald-800/70">
                    {tx("Order date", "Ngay dat")}: {new Date(order.createdAt).toLocaleDateString(locale)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-emerald-800/70">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-900">
                    {order.status.toUpperCase()}
                  </span>
                  <span>
                    {tx("Total", "Tong")}: {order.total.toFixed(2)} {order.currency}
                  </span>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {order.items.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-emerald-100 bg-white/70 p-4">
                    <Link href={`/courses/${item.courseSlug}`} className="text-sm font-semibold text-emerald-950">
                      {item.courseTitle}
                    </Link>
                    <p className="text-[11px] text-emerald-800/70">
                      {tx("Qty", "So luong")}: {item.quantity}
                    </p>
                    <p className="text-xs font-semibold text-emerald-900">
                      {item.lineTotal.toFixed(2)} {order.currency}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Link
                        href={`/learn/${item.courseSlug}`}
                        className="rounded-full border border-emerald-200 px-3 py-1 text-[11px] font-semibold text-emerald-900"
                      >
                        {tx("Continue", "Tiep tuc")}
                      </Link>
                      <Link
                        href={`/courses/${item.courseSlug}`}
                        className="rounded-full bg-emerald-700 px-3 py-1 text-[11px] font-semibold text-white"
                      >
                        {tx("Course details", "Chi tiet khoa hoc")}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
