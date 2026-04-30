"use client";

import OrderTrackingHero from "@/components/order-tracking/OrderTrackingHero";
import OrderTrackingCard from "@/components/order-tracking/OrderTrackingCard";
import OrderTrackingEmptyState from "@/components/order-tracking/OrderTrackingEmptyState";
import OrderTrackingProcess from "@/components/order-tracking/OrderTrackingProcess";
import { useOrderTrackingPage } from "@/components/order-tracking/useOrderTrackingPage";

export default function OrderTracking() {
  const tracking = useOrderTrackingPage();

  return (
    <div className="min-h-screen bg-gray-50">
      <OrderTrackingHero searchInput={tracking.searchInput} onSearchInputChange={tracking.setSearchInput} onTrack={tracking.handleTrack} />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {tracking.loading ? <div className="py-8 text-center text-gray-500">Đang tải đơn hàng...</div> : null}

        <OrderTrackingEmptyState isAuthenticated={tracking.isAuthenticated} trackedOrderExists={Boolean(tracking.trackedOrder)} notFound={tracking.notFound} />

        {tracking.trackedOrder ? (
          <div className="mb-8">
            <h2 className="mb-4 font-bold text-gray-900">Kết quả tra cứu</h2>
            <OrderTrackingCard order={tracking.trackedOrder} onDownloadInvoice={tracking.handleDownloadInvoice} />
          </div>
        ) : null}

        {tracking.userOrders.length > 0 ? (
          <div>
            <h2 className="mb-4 font-bold text-gray-900">Đơn hàng của tôi ({tracking.userOrders.length})</h2>
            <div className="space-y-5">
              {tracking.userOrders.map((order) => (
                <OrderTrackingCard key={order.id} order={order} onDownloadInvoice={tracking.handleDownloadInvoice} />
              ))}
            </div>
          </div>
        ) : null}

        <OrderTrackingProcess />
      </div>
    </div>
  );
}
