"use client";

import { AlertCircle, CheckCircle, Package, Truck } from "lucide-react";

export default function OrderTrackingProcess() {
  return (
    <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6">
      <h3 className="mb-5 font-bold text-gray-900">Quy trình xử lý đơn hàng</h3>
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { icon: <Package className="size-6 text-blue-500" />, title: "Đặt hàng", desc: "Đơn hàng được ghi nhận ngay sau khi thanh toán" },
          { icon: <AlertCircle className="size-6 text-yellow-500" />, title: "Xác nhận", desc: "Hệ thống xác nhận thanh toán trong 5 phút" },
          { icon: <Truck className="size-6 text-purple-500" />, title: "Xử lý", desc: "Kích hoạt quyền truy cập khóa học cho bạn" },
          { icon: <CheckCircle className="size-6 text-green-500" />, title: "Hoàn thành", desc: "Bạn có thể học ngay lập tức, mọi lúc mọi nơi" },
        ].map((step, i) => (
          <div key={i} className="text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-gray-50">{step.icon}</div>
            <p className="mb-1 text-sm font-semibold text-gray-900">{step.title}</p>
            <p className="text-xs text-gray-500">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
