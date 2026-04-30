"use client";

import { CreditCard, Smartphone, Wallet } from "lucide-react";
import { useI18n } from "@/app/providers";

export type PaymentMethod = "card" | "momo" | "vnpay" | "zalopay";

export const paymentOptions: { id: PaymentMethod; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "card", label: "Card", icon: <CreditCard className="size-5" />, desc: "Visa, Mastercard, JCB" },
  { id: "momo", label: "MoMo", icon: <Wallet className="size-5 text-pink-500" />, desc: "QR scan or app payment" },
  { id: "vnpay", label: "VNPay", icon: <Smartphone className="size-5 text-blue-500" />, desc: "Pay with VNPay wallet" },
  { id: "zalopay", label: "ZaloPay", icon: <Wallet className="size-5 text-sky-500" />, desc: "Pay with ZaloPay wallet" },
];

type Props = {
  paymentMethod: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
};

export default function CheckoutPaymentOptions({ paymentMethod, onChange }: Props) {
  const { tx } = useI18n();

  const localizedOptions = paymentOptions.map((option) => ({
    ...option,
    label:
      option.id === "card"
        ? tx("Credit / debit card", "Thẻ tín dụng / Ghi nợ")
        : option.id === "momo"
          ? tx("MoMo wallet", "Ví MoMo")
          : option.id === "vnpay"
            ? "VNPay"
            : "ZaloPay",
    desc:
      option.id === "card"
        ? tx("Visa, Mastercard, JCB", "Visa, Mastercard, JCB")
        : option.id === "momo"
          ? tx("Scan QR or pay in the app", "Quét mã QR hoặc thanh toán qua app")
          : option.id === "vnpay"
            ? tx("Pay with VNPay wallet", "Thanh toán qua ví VNPay")
            : tx("Pay with ZaloPay wallet", "Thanh toán qua ví ZaloPay"),
  }));

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <h2 className="mb-4 text-lg font-semibold text-slate-950">{tx("Payment method", "Phương thức thanh toán")}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {localizedOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`rounded-2xl border p-4 text-left transition ${
              paymentMethod === option.id ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-200"
            }`}
          >
            <div className="mb-1 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100">{option.icon}</div>
              <div>
                <p className="font-semibold text-slate-950">{option.label}</p>
                <p className="text-xs text-slate-500">{option.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
