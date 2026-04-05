"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
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

export default function OrderDetailPage() {
  const { tx, locale } = useI18n();
  const params = useParams();
  const orderId = Number(params?.id);
  const [order, setOrder] = useState<Order | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusSteps = useMemo(
    () => [
      { key: "placed", label: tx("Placed", "Da dat") },
      { key: "paid", label: tx("Paid", "Da thanh toan") },
      { key: "completed", label: tx("Completed", "Hoan tat") },
    ],
    [tx]
  );

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

  useEffect(() => {
    const loadOrder = async () => {
      if (!Number.isFinite(orderId)) {
        setError(tx("Invalid order id.", "Ma don hang khong hop le."));
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setNeedsAuth(true);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/orders/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401 || res.status === 403) {
          setNeedsAuth(true);
          return;
        }

        if (!res.ok) {
          setError(tx("Unable to load your order.", "Khong the tai don hang."));
          return;
        }

        const orders = (await res.json()) as Order[];
        const found = orders.find((item) => item.id === orderId) ?? null;
        if (!found) {
          setError(tx("Order not found.", "Khong tim thay don hang."));
        }
        setOrder(found);
      } catch {
        setError(tx("Unable to reach the API.", "Khong the ket noi API."));
      }
    };

    loadOrder();
  }, [orderId, tx]);

  if (needsAuth) {
    return (
      <div className="section-shell py-16 fade-in">
        <div className="surface-card p-10 text-center">
          <p className="text-sm text-emerald-800/70">
            {tx("Please sign in to view your order.", "Vui long dang nhap de xem don hang.")}
          </p>
          <Link
            href={`/login?next=/orders/${orderId}`}
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
        <Link href="/orders" className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {tx("Orders", "Don hang")}
        </Link>
        <h1 className="section-title text-4xl font-semibold text-emerald-950">
          {tx("Order details", "Chi tiet don hang")}
        </h1>
        <p className="text-sm text-emerald-800/70">
          {tx("Full breakdown of your purchase.", "Thong tin chi tiet cho don hang cua ban.")}
        </p>
      </div>

      {error && (
        <div className="surface-card border border-amber-200 bg-amber-50/80 p-6 text-sm text-amber-900">
          {error}
        </div>
      )}

      {!error && !order && (
        <div className="surface-card p-10 text-center text-sm text-emerald-800/70">
          {tx("Loading order...", "Dang tai don hang...")}
        </div>
      )}

      {order && (
        <div className="space-y-6">
          <div className="surface-card p-6">
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
                <span className="rounded-full bg-[color:var(--brand-soft)] px-3 py-1 text-emerald-900">
                  {(order.status || tx("paid", "da thanh toan")).toUpperCase()}
                </span>
                <span>
                  {tx("Total", "Tong")}: {order.total.toFixed(2)} {order.currency}
                </span>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-full border border-[color:var(--stroke)] px-3 py-1 text-[11px] font-semibold text-emerald-900"
                >
                  {tx("Print invoice", "In hoa don")}
                </button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] font-semibold">
              {statusSteps.map((step, index) => {
                const statusKey = order.status?.toLowerCase?.() ?? "";
                const statusIndex = statusIndexMap[statusKey] ?? 0;
                return (
                  <div key={step.key} className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        index <= statusIndex ? "bg-emerald-600" : "bg-[color:var(--stroke)]"
                      }`}
                    />
                    <span className={`${index <= statusIndex ? "text-emerald-900" : "text-emerald-700/60"}`}>
                      {step.label}
                    </span>
                    {index < statusSteps.length - 1 && (
                      <span className="h-px w-8 bg-[color:var(--stroke)]" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="surface-card p-6">
            <h2 className="section-title text-2xl font-semibold text-emerald-950">
              {tx("Items", "Danh sach khoa hoc")}
            </h2>
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
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-6 text-sm text-emerald-800/70">
            {tx("Need help with this order?", "Can ho tro don hang nay?")}{" "}
            <Link href="/support" className="font-semibold text-emerald-900 underline">
              {tx("Contact support", "Lien he ho tro")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
