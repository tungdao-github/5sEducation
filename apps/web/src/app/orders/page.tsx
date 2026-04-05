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
  const totalOrders = items.length;
  const totalSpent = items.reduce((sum, order) => sum + (order.total || 0), 0);

  const statusSteps = [
    { key: "placed", label: tx("Placed", "Da dat") },
    { key: "paid", label: tx("Paid", "Da thanh toan") },
    { key: "completed", label: tx("Completed", "Hoan tat") },
  ];

  const statusIndexMap: Record<string, number> = {
    placed: 0,
    pending: 0,
    created: 0,
    paid: 1,
    processing: 1,
    completed: 2,
    fulfilled: 2,
    shipped: 2,
  };

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
      <div className="section-shell py-16 fade-in">
        <div className="surface-card p-10 text-center">
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
    <div className="section-shell space-y-8 py-12 fade-in">
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
        <div className="flex flex-wrap gap-3 text-sm text-emerald-800/70">
          <div className="stat-pill">
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-emerald-700">
              {tx("Orders", "Don hang")}
            </span>
            <span className="text-sm font-semibold text-emerald-950">{totalOrders}</span>
          </div>
          <div className="stat-pill">
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-emerald-700">
              {tx("Total spent", "Tong chi")}
            </span>
            <span className="text-sm font-semibold text-emerald-950">
              {totalSpent.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="surface-card p-10 text-center text-sm text-emerald-800/70">
          {tx("No orders yet.", "Chua co don hang nao.")}
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((order) => (
            <div key={order.id} className="surface-card p-6">
              {(() => {
                const statusKey = order.status?.toLowerCase?.() ?? "";
                const isCancelled =
                  statusKey === "cancelled" ||
                  statusKey === "canceled" ||
                  statusKey === "refunded";
                const statusIndex = statusIndexMap[statusKey] ?? 0;

                return (
                  <>
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
                  <span
                    className={`rounded-full px-3 py-1 text-emerald-900 ${
                      isCancelled ? "bg-rose-100 text-rose-700" : "bg-[color:var(--brand-soft)]"
                    }`}
                  >
                    {(order.status || tx("paid", "da thanh toan")).toUpperCase()}
                  </span>
                  <span>
                    {tx("Total", "Tong")}: {order.total.toFixed(2)} {order.currency}
                  </span>
                  <Link
                    href={`/orders/${order.id}`}
                    className="rounded-full border border-[color:var(--stroke)] px-3 py-1 text-[11px] font-semibold text-emerald-900"
                  >
                    {tx("Details", "Chi tiet")}
                  </Link>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] font-semibold">
                {statusSteps.map((step, index) => (
                  <div key={step.key} className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        index <= statusIndex && !isCancelled
                          ? "bg-emerald-600"
                          : "bg-[color:var(--stroke)]"
                      }`}
                    />
                    <span
                      className={`${
                        index <= statusIndex && !isCancelled
                          ? "text-emerald-900"
                          : "text-emerald-700/60"
                      }`}
                    >
                      {step.label}
                    </span>
                    {index < statusSteps.length - 1 && (
                      <span className="h-px w-8 bg-[color:var(--stroke)]" />
                    )}
                  </div>
                ))}
              </div>
                  </>
                );
              })()}
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {order.items.map((item) => (
                  <div key={item.id} className="surface-muted p-4">
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
                        className="rounded-full border border-[color:var(--stroke)] px-3 py-1 text-[11px] font-semibold text-emerald-900"
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


