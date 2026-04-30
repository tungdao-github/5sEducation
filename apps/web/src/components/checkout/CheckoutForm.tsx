"use client";

import { Lock, Tag, X } from "lucide-react";
import { useI18n } from "@/app/providers";
import { formatPrice } from "@/services/api";
import CheckoutPaymentOptions from "@/components/checkout/CheckoutPaymentOptions";
import type { PaymentMethod } from "@/components/checkout/CheckoutPaymentOptions";

type Props = {
  formData: {
    email: string;
    fullName: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
  };
  paymentMethod: PaymentMethod;
  onChangePaymentMethod: (method: PaymentMethod) => void;
  couponInput: string;
  onCouponInputChange: (value: string) => void;
  appliedCoupon: { code: string; discount: number } | null;
  isApplyingCoupon: boolean;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isProcessing: boolean;
  finalPrice: number;
  onSubmit: (e: React.FormEvent) => void;
};

export default function CheckoutForm({
  formData,
  paymentMethod,
  onChangePaymentMethod,
  couponInput,
  onCouponInputChange,
  appliedCoupon,
  isApplyingCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  onChange,
  isProcessing,
  finalPrice,
  onSubmit,
}: Props) {
  const { tx } = useI18n();

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Lock className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">{tx("Contact information", "Thông tin liên hệ")}</h2>
            <p className="text-sm text-slate-500">{tx("Complete your course purchase quickly and securely", "Hoàn tất mua khóa học an toàn và nhanh chóng")}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-slate-700">
              {tx("Full name", "Họ và tên")} *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              value={formData.fullName}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nguyễn Văn A"
            />
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
        <h2 className="mb-4 text-lg font-semibold text-slate-950">{tx("Discount code", "Mã giảm giá")}</h2>
        {appliedCoupon ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <Tag className="size-4 shrink-0 text-emerald-600" />
            <div className="flex-1">
              <span className="font-mono font-bold text-emerald-700">{appliedCoupon.code}</span>
              <span className="ml-2 text-sm text-emerald-600">
                {tx("Save", "Giảm")} {formatPrice(appliedCoupon.discount)}
              </span>
            </div>
            <button type="button" onClick={onRemoveCoupon} className="p-1 text-emerald-500 hover:text-emerald-700">
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => onCouponInputChange(e.target.value)}
              placeholder={tx("Enter discount code", "Nhập mã giảm giá")}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={onApplyCoupon}
              disabled={isApplyingCoupon}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
            >
              {isApplyingCoupon ? "..." : tx("Apply", "Áp dụng")}
            </button>
          </div>
        )}
      </div>

      <CheckoutPaymentOptions paymentMethod={paymentMethod} onChange={onChangePaymentMethod} />

      {paymentMethod === "card" ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
          <h2 className="mb-4 text-lg font-semibold text-slate-950">{tx("Card information", "Thông tin thẻ")}</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{tx("Card number", "Số thẻ")}</label>
              <input
                name="cardNumber"
                value={formData.cardNumber}
                onChange={onChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1234 5678 9012 3456"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{tx("Expiry date", "Ngày hết hạn")}</label>
                <input
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={onChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="MM/YY"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">CVV</label>
                <input
                  name="cvv"
                  value={formData.cvv}
                  onChange={onChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123"
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isProcessing}
        className="w-full rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {isProcessing ? tx("Processing payment...", "Đang xử lý thanh toán...") : `${tx("Pay", "Thanh toán")} ${formatPrice(finalPrice)}`}
      </button>
    </form>
  );
}
