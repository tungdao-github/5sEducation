"use client";

import { useI18n } from "@/app/providers";
import { formatPrice } from "@/services/api";
import type { Course } from "@/contexts/CartContext";

type Props = {
  cartItems: Course[];
  totalPrice: number;
  appliedCoupon: { code: string; discount: number } | null;
  finalPrice: number;
};

export default function CheckoutSummary({ cartItems, totalPrice, appliedCoupon, finalPrice }: Props) {
  const { tx } = useI18n();

  return (
    <aside className="h-fit lg:sticky lg:top-24">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
        <h2 className="mb-5 text-xl font-bold text-slate-950">{tx("Order summary", "Tóm tắt đơn hàng")}</h2>
        <div className="space-y-4 border-b border-slate-200 pb-5">
          {cartItems.map((course) => (
            <div key={course.id} className="flex items-center gap-3">
              <img src={course.image} alt={course.title} className="h-16 w-20 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold text-slate-950">{course.title}</p>
                <p className="text-xs text-slate-500">{course.instructor}</p>
              </div>
              <div className="text-sm font-semibold text-slate-950">{formatPrice(course.price)}</div>
            </div>
          ))}
        </div>
        <div className="space-y-3 py-5 text-slate-700">
          <div className="flex justify-between">
            <span>{tx("Subtotal", "Tổng phụ")}:</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          {appliedCoupon ? (
            <div className="flex justify-between text-emerald-700">
              <span>{tx("Discount", "Giảm giá")}:</span>
              <span>-{formatPrice(appliedCoupon.discount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-bold text-slate-950">
            <span>{tx("Total", "Tổng cộng")}:</span>
            <span className="text-blue-600">{formatPrice(finalPrice)}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
