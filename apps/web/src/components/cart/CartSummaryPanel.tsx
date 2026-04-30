"use client";

import { ShieldCheck } from "lucide-react";
import { Link } from "@/lib/router";
import { formatPrice } from "@/services/api";

type Props = {
  totalPrice: number;
};

export default function CartSummaryPanel({ totalPrice }: Props) {
  return (
    <aside className="lg:sticky lg:top-24 h-fit">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
        <h2 className="mb-6 text-xl font-bold text-slate-950">Tổng quan đơn hàng</h2>
        <div className="mb-6 space-y-3 text-slate-700">
          <div className="flex justify-between">
            <span>Tổng phụ:</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span>Thuế:</span>
            <span>{formatPrice(0)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-bold text-slate-950">
            <span>Tổng cộng:</span>
            <span className="text-blue-600">{formatPrice(totalPrice)}</span>
          </div>
        </div>
        <Link to="/checkout" className="mb-3 block rounded-2xl bg-slate-900 py-3 text-center font-semibold text-white transition hover:bg-slate-700">
          Tiến hành thanh toán
        </Link>
        <Link to="/" className="block rounded-2xl bg-slate-100 py-3 text-center font-medium text-slate-700 transition hover:bg-slate-200">
          Tiếp tục mua sắm
        </Link>
        <div className="mt-6 border-t border-slate-200 pt-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ShieldCheck className="size-4 text-emerald-600" />
            Quyền lợi của bạn
          </div>
          <ul className="space-y-2 text-sm text-slate-600">
            {["Truy cập trọn đời", "Chứng chỉ hoàn thành", "Cập nhật miễn phí", "Hoàn tiền trong 30 ngày"].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-600">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
