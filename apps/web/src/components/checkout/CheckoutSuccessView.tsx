"use client";

import { CheckCircle, Download, Mail } from "lucide-react";
import { useI18n } from "@/app/providers";

type Props = {
  displayOrderId: string;
  onDownloadInvoice: () => void;
  onViewOrders: () => void;
  onStartLearning: () => void;
};

export default function CheckoutSuccessView({ displayOrderId, onDownloadInvoice, onViewOrders, onStartLearning }: Props) {
  const { tx } = useI18n();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] py-12">
      <div className="mx-4 w-full max-w-md">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_70px_rgba(15,23,42,0.12)]">
          <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="size-10 text-emerald-600" />
          </div>
          <h2 className="mb-2 text-2xl font-semibold text-slate-950">{tx("Payment successful!", "Thanh toán thành công!")}</h2>
          <p className="mb-2 text-slate-600">
            {tx(
              "Thank you for purchasing the course. Access details have been sent to your email.",
              "Cảm ơn bạn đã mua khóa học. Thông tin truy cập đã được gửi đến email của bạn."
            )}
          </p>
          {displayOrderId ? (
            <div className="mb-4 rounded-lg bg-slate-50 px-4 py-2">
              <p className="text-xs text-slate-500">{tx("Order code", "Mã đơn hàng")}</p>
              <p className="font-mono text-sm font-bold text-slate-950">{displayOrderId}</p>
            </div>
          ) : null}
          <div className="mb-6 flex gap-2">
            <div className="flex-1 rounded-xl bg-blue-50 px-3 py-2 text-xs">
              <Mail className="mx-auto mb-1 size-4 text-blue-600" />
              <p className="font-medium text-blue-700">{tx("Email sent", "Email đã gửi")}</p>
            </div>
            <button
              onClick={onDownloadInvoice}
              className="group flex-1 rounded-xl bg-emerald-50 px-3 py-2 text-xs transition-colors hover:bg-emerald-100"
            >
              <Download className="mx-auto mb-1 size-4 text-emerald-600 transition-transform group-hover:translate-y-0.5" />
              <p className="font-medium text-emerald-700">{tx("Download invoice", "Tải hóa đơn")}</p>
            </button>
          </div>
          <div className="mb-6 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {tx("Check your email for course access instructions.", "Kiểm tra email để nhận hướng dẫn truy cập khóa học nhé!")}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onViewOrders}
              className="flex-1 rounded-xl border border-blue-600 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              {tx("View orders", "Xem đơn hàng")}
            </button>
            <button
              onClick={onStartLearning}
              className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              {tx("Start learning", "Bắt đầu học")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
