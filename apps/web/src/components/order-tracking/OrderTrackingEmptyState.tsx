"use client";

import { Package, XCircle } from "lucide-react";
import { Link } from "@/lib/router";
import { useI18n } from "@/app/providers";

type Props = {
  isAuthenticated: boolean;
  trackedOrderExists: boolean;
  notFound: boolean;
};

export default function OrderTrackingEmptyState({ isAuthenticated, trackedOrderExists, notFound }: Props) {
  const { tx } = useI18n();

  if (notFound) {
    return (
      <div className="mb-8 rounded-2xl border border-gray-200 bg-white py-12 text-center">
        <XCircle className="mx-auto mb-3 size-12 text-red-400" />
        <h3 className="mb-1 font-bold text-gray-900">{tx("Order not found", "Không tìm thấy đơn hàng")}</h3>
        <p className="text-sm text-gray-500">{tx("Check the order code or contact support: support@educourse.vn", "Kiểm tra lại mã đơn hàng hoặc liên hệ hỗ trợ: support@educourse.vn")}</p>
      </div>
    );
  }

  if (!isAuthenticated && !trackedOrderExists) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white py-12 text-center">
        <Package className="mx-auto mb-3 size-12 text-gray-300" />
        <h3 className="mb-1 font-bold text-gray-900">{tx("Order lookup", "Tra cứu đơn hàng")}</h3>
        <p className="mb-4 text-sm text-gray-500">{tx("Enter an order code above, or sign in to view all orders", "Nhập mã đơn hàng ở trên, hoặc đăng nhập để xem tất cả đơn hàng")}</p>
        <Link to="/account?tab=orders" className="text-sm font-medium text-blue-600 hover:underline">
          {tx("Sign in to view orders", "Đăng nhập để xem đơn hàng")} →
        </Link>
      </div>
    );
  }

  return null;
}
