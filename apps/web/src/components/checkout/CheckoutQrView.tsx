"use client";

import { CheckCircle, QrCode } from "lucide-react";
import { useI18n } from "@/app/providers";
import { formatPrice } from "@/services/api";

type Props = {
  paymentLabel: string;
  displayOrderId: string;
  finalPrice: number;
  isProcessing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function CheckoutQrView({ paymentLabel, displayOrderId, finalPrice, isProcessing, onCancel, onConfirm }: Props) {
  const { tx } = useI18n();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] py-12">
      <div className="mx-4 w-full max-w-md">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_70px_rgba(15,23,42,0.12)]">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-blue-100">
            <QrCode className="size-8 text-blue-600" />
          </div>
          <h2 className="mb-2 text-2xl font-semibold text-slate-950">{tx("Scan QR to pay", "Quét mã QR để thanh toán")}</h2>
          <p className="mb-6 text-slate-600">
            {tx("Open your payment app", "Mở ứng dụng")} {paymentLabel} {tx("and scan the QR code", "và quét mã QR")}
          </p>
          <div className="mx-auto mb-6 inline-block rounded-[28px] border-2 border-slate-200 bg-white p-6">
            <div className="flex size-48 items-center justify-center rounded-2xl bg-slate-100">
              <div className="text-center">
                <QrCode className="mx-auto mb-2 size-16 text-slate-400" />
                <p className="text-xs text-slate-500">{tx("Payment QR code", "QR Code thanh toán")}</p>
                <p className="mt-1 text-xs text-slate-400">{displayOrderId || "EDU..."}</p>
              </div>
            </div>
          </div>
          <div className="mb-6">
            <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <p className="font-medium">
                {tx("Amount", "Số tiền")}: {formatPrice(finalPrice)}
              </p>
            </div>
            <p className="text-xs text-slate-500">
              {tx('Demo: click "Confirm payment" to simulate callback', 'Demo: Click "Xác nhận đã thanh toán" để mô phỏng callback')}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {tx("Cancel", "Hủy")}
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {isProcessing ? tx("Processing...", "Đang xử lý...") : tx("Confirm payment", "Xác nhận đã thanh toán")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
