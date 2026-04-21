"use client";

import { useState } from "react";
import { useNavigate } from "@/figma/compat/router";
import { useCart } from "../contexts/CartContext";
import { CheckCircle, CreditCard, Download, Mail, QrCode, Smartphone, Tag, Wallet, X, Lock } from "lucide-react";
import { toast } from "@/figma/compat/sonner";
import { formatPrice, validateCoupon } from "../data/api";

type PaymentMethod = "card" | "momo" | "vnpay" | "zalopay";

const paymentOptions: { id: PaymentMethod; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "card", label: "Thẻ tín dụng / Ghi nợ", icon: <CreditCard className="size-5" />, desc: "Visa, Mastercard, JCB" },
  { id: "momo", label: "Ví MoMo", icon: <Wallet className="size-5 text-pink-500" />, desc: "Quét mã QR hoặc thanh toán qua app" },
  { id: "vnpay", label: "VNPay", icon: <Smartphone className="size-5 text-blue-500" />, desc: "Thanh toán qua ví VNPay" },
  { id: "zalopay", label: "ZaloPay", icon: <Wallet className="size-5 text-sky-500" />, desc: "Thanh toán qua ví ZaloPay" },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, totalPrice, checkout } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [displayOrderId, setDisplayOrderId] = useState("");
  const [formData, setFormData] = useState({ email: "", fullName: "", cardNumber: "", expiryDate: "", cvv: "" });

  const finalPrice = appliedCoupon ? Math.max(0, totalPrice - appliedCoupon.discount) : totalPrice;

  if (cartItems.length === 0 && !isComplete) {
    navigate("/cart");
    return null;
  }

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setIsApplyingCoupon(true);
    try {
      const result = await validateCoupon(code, totalPrice);
      if (result.isValid) {
        setAppliedCoupon({ code, discount: result.discount });
        toast.success(`Áp dụng mã "${code}" - Giảm ${formatPrice(result.discount)}!`);
        setCouponInput("");
      } else {
        toast.error(result.message || "Mã giảm giá không hợp lệ");
      }
    } catch {
      toast.error("Không thể áp dụng mã giảm giá");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast("Đã xóa mã giảm giá");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === "momo" || paymentMethod === "vnpay" || paymentMethod === "zalopay") {
      if (!displayOrderId) setDisplayOrderId(`EDU${Date.now()}`);
      setShowQRCode(true);
      return;
    }

    setIsProcessing(true);
    try {
      const newOrder = await checkout(appliedCoupon?.code);
      if (!newOrder) {
        toast.error("Vui lòng đăng nhập để thanh toán");
        return;
      }
      setDisplayOrderId(`EDU${newOrder.id}`);
      setIsComplete(true);
    } catch {
      toast.error("Thanh toán thất bại. Vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQRPaymentComplete = async () => {
    setIsProcessing(true);
    setShowQRCode(false);
    try {
      const newOrder = await checkout(appliedCoupon?.code);
      if (!newOrder) {
        toast.error("Vui lòng đăng nhập để thanh toán");
        return;
      }
      setDisplayOrderId(`EDU${newOrder.id}`);
      setIsComplete(true);
      toast.success("Thanh toán thành công!");
    } catch {
      toast.error("Không thể xác nhận thanh toán. Vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadInvoice = () => {
    toast.success("Đang tải hóa đơn PDF...");
    setTimeout(() => toast.success("Hóa đơn đã được tải xuống!"), 1000);
  };

  if (showQRCode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] py-12">
        <div className="mx-4 w-full max-w-md">
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_70px_rgba(15,23,42,0.12)]">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-blue-100"><QrCode className="size-8 text-blue-600" /></div>
            <h2 className="mb-2 text-2xl font-semibold text-slate-950">Quét mã QR để thanh toán</h2>
            <p className="mb-6 text-slate-600">Mở ứng dụng {paymentMethod === "momo" ? "MoMo" : paymentMethod === "vnpay" ? "VNPay" : "ZaloPay"} và quét mã QR</p>
            <div className="mx-auto mb-6 inline-block rounded-[28px] border-2 border-slate-200 bg-white p-6">
              <div className="flex size-48 items-center justify-center rounded-2xl bg-slate-100">
                <div className="text-center">
                  <QrCode className="mx-auto mb-2 size-16 text-slate-400" />
                  <p className="text-xs text-slate-500">QR Code thanh toán</p>
                  <p className="mt-1 text-xs text-slate-400">{displayOrderId || "EDU..."}</p>
                </div>
              </div>
            </div>
            <div className="mb-6">
              <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700"><p className="font-medium">Số tiền: {formatPrice(finalPrice)}</p></div>
              <p className="text-xs text-slate-500">Demo: Click "Xác nhận đã thanh toán" để mô phỏng callback</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowQRCode(false)} className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Hủy</button>
              <button onClick={handleQRPaymentComplete} disabled={isProcessing} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60">{isProcessing ? "Đang xử lý..." : "Xác nhận đã thanh toán"}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] py-12">
        <div className="mx-4 w-full max-w-md">
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_70px_rgba(15,23,42,0.12)]">
            <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-emerald-100"><CheckCircle className="size-10 text-emerald-600" /></div>
            <h2 className="mb-2 text-2xl font-semibold text-slate-950">Thanh toán thành công!</h2>
            <p className="mb-2 text-slate-600">Cảm ơn bạn đã mua khóa học. Thông tin truy cập đã được gửi đến email của bạn.</p>
            {displayOrderId && <div className="mb-4 rounded-lg bg-slate-50 px-4 py-2"><p className="text-xs text-slate-500">Mã đơn hàng</p><p className="font-mono text-sm font-bold text-slate-950">{displayOrderId}</p></div>}
            <div className="mb-6 flex gap-2">
              <div className="flex-1 rounded-xl bg-blue-50 px-3 py-2 text-xs"><Mail className="mx-auto mb-1 size-4 text-blue-600" /><p className="font-medium text-blue-700">Email đã gửi</p></div>
              <button onClick={handleDownloadInvoice} className="group flex-1 rounded-xl bg-emerald-50 px-3 py-2 text-xs transition-colors hover:bg-emerald-100"><Download className="mx-auto mb-1 size-4 text-emerald-600 transition-transform group-hover:translate-y-0.5" /><p className="font-medium text-emerald-700">Tải hóa đơn</p></button>
            </div>
            <div className="mb-6 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">Kiểm tra email để nhận hướng dẫn truy cập khóa học nhé!</div>
            <div className="flex gap-3">
              <button onClick={() => navigate("/account?tab=orders")} className="flex-1 rounded-xl border border-blue-600 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50">Xem đơn hàng</button>
              <button onClick={() => navigate("/my-learning")} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">Bắt đầu học</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Lock className="size-5" /></div>
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950">Thanh toán</h1>
            <p className="text-sm text-slate-500">Hoàn tất mua khóa học an toàn và nhanh chóng</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
              <h2 className="mb-4 text-lg font-semibold text-slate-950">Thông tin liên hệ</h2>
              <div className="space-y-4">
                <div><label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">Email *</label><input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="email@example.com" /></div>
                <div><label htmlFor="fullName" className="mb-1 block text-sm font-medium text-slate-700">Họ và tên *</label><input type="text" id="fullName" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nguyễn Văn A" /></div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
              <h2 className="mb-4 text-lg font-semibold text-slate-950">Mã giảm giá</h2>
              {appliedCoupon ? (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <Tag className="size-4 shrink-0 text-emerald-600" />
                  <div className="flex-1"><span className="font-mono font-bold text-emerald-700">{appliedCoupon.code}</span><span className="ml-2 text-sm text-emerald-600">— Giảm {formatPrice(appliedCoupon.discount)}</span></div>
                  <button type="button" onClick={handleRemoveCoupon} className="p-1 text-emerald-500 hover:text-emerald-700"><X className="size-4" /></button>
                </div>
              ) : (
                <div className="flex gap-2"><input type="text" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="Nhập mã giảm giá" className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /><button type="button" onClick={handleApplyCoupon} disabled={isApplyingCoupon} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60">{isApplyingCoupon ? "..." : "Áp dụng"}</button></div>
              )}
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
              <h2 className="mb-4 text-lg font-semibold text-slate-950">Phương thức thanh toán</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {paymentOptions.map((option) => (
                  <button key={option.id} type="button" onClick={() => setPaymentMethod(option.id)} className={`rounded-2xl border p-4 text-left transition ${paymentMethod === option.id ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-200"}`}>
                    <div className="mb-1 flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-slate-100">{option.icon}</div><div><p className="font-semibold text-slate-950">{option.label}</p><p className="text-xs text-slate-500">{option.desc}</p></div></div>
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === "card" && (
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                <h2 className="mb-4 text-lg font-semibold text-slate-950">Thông tin thẻ</h2>
                <div className="space-y-4">
                  <div><label className="mb-1 block text-sm font-medium text-slate-700">Số thẻ</label><input name="cardNumber" value={formData.cardNumber} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="1234 5678 9012 3456" /></div>
                  <div className="grid gap-4 md:grid-cols-2"><div><label className="mb-1 block text-sm font-medium text-slate-700">Ngày hết hạn</label><input name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="MM/YY" /></div><div><label className="mb-1 block text-sm font-medium text-slate-700">CVV</label><input name="cvv" value={formData.cvv} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="123" /></div></div>
                </div>
              </div>
            )}

            <button type="submit" disabled={isProcessing} className="w-full rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60">
              {isProcessing ? "Đang xử lý thanh toán..." : `Thanh toán ${formatPrice(finalPrice)}`}
            </button>
          </form>

          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
              <h2 className="mb-5 text-xl font-bold text-slate-950">Tóm tắt đơn hàng</h2>
              <div className="space-y-4 border-b border-slate-200 pb-5">
                {cartItems.map((course) => (
                  <div key={course.id} className="flex items-center gap-3">
                    <img src={course.image} alt={course.title} className="h-16 w-20 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-semibold text-slate-950">{course.title}</p><p className="text-xs text-slate-500">{course.instructor}</p></div>
                    <div className="text-sm font-semibold text-slate-950">{formatPrice(course.price)}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-3 py-5 text-slate-700">
                <div className="flex justify-between"><span>Tổng phụ:</span><span>{formatPrice(totalPrice)}</span></div>
                {appliedCoupon && <div className="flex justify-between text-emerald-700"><span>Giảm giá:</span><span>-{formatPrice(appliedCoupon.discount)}</span></div>}
                <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-bold text-slate-950"><span>Tổng cộng:</span><span className="text-blue-600">{formatPrice(finalPrice)}</span></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
