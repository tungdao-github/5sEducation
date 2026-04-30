"use client";

import { useState } from "react";
import { useNavigate } from "@/lib/router";
import { useCart } from "@/contexts/CartContext";
import { useI18n } from "@/app/providers";
import { toast } from "@/lib/notify";
import { formatPrice, validateCoupon } from "@/services/api";
import { paymentOptions, type PaymentMethod } from "@/components/checkout/CheckoutPaymentOptions";

export function useCheckoutFlow() {
  const navigate = useNavigate();
  const { locale, tx } = useI18n();
  const { cartItems, totalPrice, checkout } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [displayOrderId, setDisplayOrderId] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const finalPrice = appliedCoupon ? Math.max(0, totalPrice - appliedCoupon.discount) : totalPrice;
  const paymentLabel = paymentOptions.find((option) => option.id === paymentMethod)?.label ?? tx("Payment app", "Ứng dụng thanh toán");

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
        toast.success(tx(`Applied coupon "${code}" - saved ${formatPrice(result.discount, locale === "vi" ? "vi-VN" : "en-US")}!`, `Áp dụng mã "${code}" - Giảm ${formatPrice(result.discount, locale === "vi" ? "vi-VN" : "en-US")}!`));
        setCouponInput("");
      } else {
        toast.error(result.message || tx("Invalid discount code", "Mã giảm giá không hợp lệ"));
      }
    } catch {
      toast.error(tx("Unable to apply discount code", "Không thể áp dụng mã giảm giá"));
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast(tx("Discount code removed", "Đã xóa mã giảm giá"));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        toast.error(tx("Please sign in to checkout", "Vui lòng đăng nhập để thanh toán"));
        return;
      }
      setDisplayOrderId(`EDU${newOrder.id}`);
      setIsComplete(true);
    } catch {
      toast.error(tx("Payment failed. Please try again.", "Thanh toán thất bại. Vui lòng thử lại."));
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
        toast.error(tx("Please sign in to checkout", "Vui lòng đăng nhập để thanh toán"));
        return;
      }
      setDisplayOrderId(`EDU${newOrder.id}`);
      setIsComplete(true);
      toast.success(tx("Payment successful!", "Thanh toán thành công!"));
    } catch {
      toast.error(tx("Unable to confirm payment. Please try again.", "Không thể xác nhận thanh toán. Vui lòng thử lại."));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadInvoice = () => {
    toast.success(tx("Downloading PDF invoice...", "Đang tải hóa đơn PDF..."));
    setTimeout(() => toast.success(tx("Invoice has been downloaded!", "Hóa đơn đã được tải xuống!")), 1000);
  };

  const handleViewOrders = () => {
    navigate("/account?tab=orders");
  };

  const handleStartLearning = () => {
    navigate("/my-learning");
  };

  return {
    cartItems,
    totalPrice,
    finalPrice,
    paymentLabel,
    isProcessing,
    isComplete,
    showQRCode,
    paymentMethod,
    setPaymentMethod,
    couponInput,
    setCouponInput,
    appliedCoupon,
    isApplyingCoupon,
    displayOrderId,
    formData,
    setFormData,
    handleApplyCoupon,
    handleRemoveCoupon,
    handleChange,
    handleSubmit,
    handleQRPaymentComplete,
    handleDownloadInvoice,
    handleViewOrders,
    handleStartLearning,
    setShowQRCode,
  } as const;
}
