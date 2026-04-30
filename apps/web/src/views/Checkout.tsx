"use client";

import CheckoutQrView from "@/components/checkout/CheckoutQrView";
import CheckoutSuccessView from "@/components/checkout/CheckoutSuccessView";
import CheckoutSummary from "@/components/checkout/CheckoutSummary";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { useCheckoutFlow } from "@/components/checkout/useCheckoutFlow";

export default function Checkout() {
  const flow = useCheckoutFlow();
  if (!flow) return null;

  const {
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
    formData,
    handleApplyCoupon,
    handleRemoveCoupon,
    handleChange,
    handleSubmit,
    handleQRPaymentComplete,
    handleDownloadInvoice,
    handleViewOrders,
    handleStartLearning,
    setShowQRCode,
  } = flow;

  if (showQRCode) {
    return (
      <CheckoutQrView
        paymentLabel={paymentLabel}
        displayOrderId={flow.displayOrderId}
        finalPrice={finalPrice}
        isProcessing={isProcessing}
        onCancel={() => setShowQRCode(false)}
        onConfirm={handleQRPaymentComplete}
      />
    );
  }

  if (isComplete) {
    return (
      <CheckoutSuccessView
        displayOrderId={flow.displayOrderId}
        onDownloadInvoice={handleDownloadInvoice}
        onViewOrders={handleViewOrders}
        onStartLearning={handleStartLearning}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <CheckoutForm
            formData={formData}
            paymentMethod={paymentMethod}
            onChangePaymentMethod={setPaymentMethod}
            couponInput={couponInput}
            onCouponInputChange={setCouponInput}
            appliedCoupon={appliedCoupon}
            isApplyingCoupon={isApplyingCoupon}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            onChange={handleChange}
            isProcessing={isProcessing}
            finalPrice={finalPrice}
            onSubmit={handleSubmit}
          />
          <CheckoutSummary cartItems={cartItems} totalPrice={totalPrice} appliedCoupon={appliedCoupon} finalPrice={finalPrice} />
        </div>
      </div>
    </div>
  );
}
