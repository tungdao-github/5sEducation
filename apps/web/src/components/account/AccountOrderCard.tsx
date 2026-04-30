"use client";

import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { useI18n } from "@/app/providers";
import { formatPrice } from "@/services/api";

export type OrderItemView = {
  id: number;
  title: string;
  instructor: string;
  image: string;
  price: number;
};

export type OrderView = {
  id: number;
  status: string;
  createdAt: string;
  total: number;
  subtotal: number;
  discountTotal: number;
  couponCode?: string | null;
  itemsView: OrderItemView[];
  trackingSteps: { label: string; done: boolean; date: string }[];
};

type Props = {
  order: OrderView;
  statusLabel: string;
  statusColor: string;
  statusIcon: ReactNode;
  onRequestRefund: (orderId: number) => void;
};

export default function AccountOrderCard({ order, statusLabel, statusColor, statusIcon, onRequestRefund }: Props) {
  const { tx, locale } = useI18n();
  const intlLocale = locale === "vi" ? "vi-VN" : locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : "en-US";

  const doneStep = order.trackingSteps.filter((step) => step.done).pop();

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <div className="flex items-center justify-between gap-3 bg-gray-50 px-4 py-3">
        <div>
          <p className="font-mono text-sm font-semibold text-gray-900">{order.id}</p>
          <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString(intlLocale)}</p>
        </div>
        <div className="flex items-center gap-2">
          {statusIcon}
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor}`}>{statusLabel}</span>
        </div>
      </div>

      <div className="space-y-2 p-4">
        {order.itemsView.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            {item.image ? <img src={item.image} alt={item.title} className="h-9 w-12 rounded object-cover" /> : <div className="h-9 w-12 rounded bg-gray-200" />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-gray-800">{item.title}</p>
              <p className="text-xs text-gray-500">{item.instructor}</p>
            </div>
            <span className="flex-shrink-0 text-sm font-bold text-blue-600">{formatPrice(item.price)}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
        <div>
          <div className="text-sm text-gray-500">{tx("Paid in VND", "Thanh toán qua VND")}</div>
          {order.couponCode && order.discountTotal > 0 ? <div className="text-xs text-green-600">{tx("Discount code", "Mã giảm giá")}: {order.couponCode}</div> : null}
        </div>
        <div className="text-right text-sm">
          {order.discountTotal > 0 ? <div className="text-xs text-gray-400 line-through">{formatPrice(order.subtotal)}</div> : null}
          <div className="font-bold text-gray-900">
            {tx("Total", "Tổng")}: <span className="text-blue-600">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center gap-1">
          {order.trackingSteps.map((step, index) => (
            <div key={index} className="flex flex-1 items-center">
              <div className={`size-2.5 flex-shrink-0 rounded-full ${step.done ? "bg-green-500" : "bg-gray-200"}`} />
              {index < order.trackingSteps.length - 1 ? (
                <div className={`mx-0.5 h-0.5 flex-1 ${step.done && order.trackingSteps[index + 1].done ? "bg-green-500" : "bg-gray-200"}`} />
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {doneStep?.label || "—"} {doneStep?.date ? `· ${doneStep.date}` : ""}
          </p>
          {canRequestRefund(order) ? (
            <button onClick={() => onRequestRefund(order.id)} className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700">
              <RotateCcw className="size-3" />
              {tx("Request refund", "Yêu cầu hoàn tiền")}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function canRequestRefund(order: OrderView) {
  if (order.status !== "completed") return false;
  const orderDate = new Date(order.createdAt);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
  return daysDiff <= 30;
}
