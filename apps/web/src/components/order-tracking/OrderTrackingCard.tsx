"use client";

import { BookOpen, CheckCircle, Clock, Download, Package, Truck, AlertCircle } from "lucide-react";
import { Link } from "@/lib/router";
import { formatPrice } from "@/services/api";
import type { OrderDto } from "@/services/api";

type OrderItemView = {
  id: number;
  title: string;
  instructor: string;
  image: string;
  price: number;
};

export type OrderView = OrderDto & {
  itemsView: OrderItemView[];
  trackingSteps: { label: string; done: boolean; date: string }[];
};

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-700" },
  processing: { label: "Đang xử lý", color: "bg-blue-100 text-blue-700" },
  completed: { label: "Hoàn thành", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-700" },
};

const stepIcons = [
  <Package className="size-4" key="package" />,
  <AlertCircle className="size-4" key="alert" />,
  <Truck className="size-4" key="truck" />,
  <CheckCircle className="size-4" key="check" />,
];

type Props = {
  order: OrderView;
  onDownloadInvoice: (order: OrderView) => void;
};

export default function OrderTrackingCard({ order, onDownloadInvoice }: Props) {
  const sc = statusConfig[order.status] ?? { label: order.status, color: "bg-gray-100 text-gray-700" };
  const doneSteps = order.trackingSteps.filter((s) => s.done).length;
  const learnHref = order.items[0]?.courseSlug ? `/learn/${order.items[0].courseSlug}` : "/my-learning";

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-3">
              <p className="font-mono font-bold text-gray-900">{order.id}</p>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${sc.color}`}>{sc.label}</span>
            </div>
            <p className="text-sm text-gray-500">Đặt ngày {new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
          </div>
          <button onClick={() => onDownloadInvoice(order)} className="flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-1.5 text-sm text-blue-600 transition hover:bg-blue-50">
            <Download className="size-4" />
            Hóa đơn
          </button>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-5">
          <p className="mb-4 text-sm font-semibold text-gray-700">Tiến trình đơn hàng</p>
          <div className="relative">
            <div className="absolute left-5 right-5 top-5 h-0.5 bg-gray-200">
              <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${((doneSteps - 1) / (order.trackingSteps.length - 1)) * 100}%` }} />
            </div>
            <div className="relative flex justify-between">
              {order.trackingSteps.map((step, i) => (
                <div key={i} className="flex flex-1 flex-col items-center">
                  <div className={`z-10 flex size-10 items-center justify-center rounded-full border-2 transition-all ${step.done ? "border-green-500 bg-green-500 text-white" : "border-gray-200 bg-white text-gray-300"}`}>
                    {step.done ? <CheckCircle className="size-5" /> : stepIcons[i] || <Clock className="size-4" />}
                  </div>
                  <p className={`mt-2 text-center text-xs ${step.done ? "font-medium text-green-700" : "text-gray-400"}`}>{step.label}</p>
                  {step.date ? <p className="mt-0.5 text-xs text-gray-400">{step.date}</p> : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-4 space-y-3">
          {order.itemsView.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
              {item.image ? <img src={item.image} alt={item.title} className="h-10 w-14 flex-shrink-0 rounded-lg object-cover" /> : <div className="h-10 w-14 flex-shrink-0 rounded-lg bg-gray-200" />}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500">{item.instructor}</p>
              </div>
              <p className="flex-shrink-0 text-sm font-semibold text-blue-600">{formatPrice(item.price)}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
          <div className="text-sm text-gray-500">
            <span>💳 {order.currency || "VND"}</span>
            {order.couponCode && order.discountTotal > 0 ? <span className="ml-2 text-green-600">Mã {order.couponCode}</span> : null}
          </div>
          <div className="text-right">
            {order.discountTotal > 0 ? <p className="text-xs text-gray-400 line-through">{formatPrice(order.subtotal)}</p> : null}
            <p className="text-xs text-gray-400">Tổng cộng</p>
            <p className="text-lg font-bold text-gray-900">{formatPrice(order.total)}</p>
          </div>
        </div>

        {order.status === "completed" ? (
          <Link to={learnHref} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-sm font-medium text-white transition hover:bg-green-700">
            <BookOpen className="size-4" />
            Vào học ngay
          </Link>
        ) : null}
      </div>
    </div>
  );
}
