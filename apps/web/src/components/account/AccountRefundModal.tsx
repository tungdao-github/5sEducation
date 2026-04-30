"use client";

import { RotateCcw, XCircle } from "lucide-react";
import { useI18n } from "@/app/providers";

type Props = {
  orderId: number | null;
  reason: string;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export default function AccountRefundModal({ orderId, reason, onReasonChange, onClose, onSubmit }: Props) {
  const { tx } = useI18n();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-6 text-white">
          <button onClick={onClose} className="absolute right-4 top-4 text-white/80 hover:text-white">
            <XCircle className="size-5" />
          </button>
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-white/20">
            <RotateCcw className="size-7" />
          </div>
          <h2 className="text-center text-xl font-bold">{tx("Request a refund", "Yêu cầu hoàn tiền")}</h2>
          <p className="mt-1 text-center text-sm text-red-100">
            {tx("Order", "Đơn hàng")}: {orderId}
          </p>
        </div>

        <div className="p-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">{tx("Refund reason *", "Lý do yêu cầu hoàn tiền *")}</label>
          <textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            rows={4}
            placeholder={tx("Tell us why you want a refund...", "Vui lòng cho chúng tôi biết lý do bạn muốn hoàn tiền...")}
            className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <div className="mt-5 flex gap-3">
            <button onClick={onClose} className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
              {tx("Cancel", "Hủy")}
            </button>
            <button onClick={onSubmit} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700">
              {tx("Submit request", "Gửi yêu cầu")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
