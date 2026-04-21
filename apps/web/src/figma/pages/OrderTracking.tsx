"use client";

import { useEffect, useState } from "react";
import { Search, CheckCircle, Clock, AlertCircle, XCircle, Package, Truck, BookOpen, ArrowLeft, Download } from "lucide-react";
import { Link } from "@/figma/compat/router";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "@/figma/compat/sonner";
import { fetchOrders, fetchCoursesByIds, mapCourseCompare, formatPrice } from "../data/api";
import type { OrderDto } from "../data/api";
import { useLanguage } from "../contexts/LanguageContext";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-700" },
  processing: { label: "Đang xử lý", color: "bg-blue-100 text-blue-700" },
  completed: { label: "Hoàn thành", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-700" },
};

const stepIcons = [
  <Package className="size-4" key="package" />,
  <AlertCircle className="size-4" key="alert" />,
  <Truck className="size-4" key="truck" />,
  <CheckCircle className="size-4" key="check" />,
];

function buildTrackingSteps(status: string, createdAt: string) {
  return [
    { label: "Đặt hàng", done: true, date: new Date(createdAt).toLocaleDateString("vi-VN") },
    { label: "Xác nhận", done: status !== "pending", date: "" },
    { label: "Xử lý", done: status === "processing" || status === "completed", date: "" },
    { label: "Hoàn thành", done: status === "completed", date: "" },
  ];
}

type OrderItemView = {
  id: number;
  title: string;
  instructor: string;
  image: string;
  price: number;
};

type OrderView = OrderDto & {
  itemsView: OrderItemView[];
  trackingSteps: { label: string; done: boolean; date: string }[];
};

export default function OrderTracking() {
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [searchInput, setSearchInput] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<OrderView | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [orders, setOrders] = useState<OrderView[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (!isAuthenticated) {
      setOrders([]);
      return () => {
        active = false;
      };
    }

    const load = async () => {
      setLoading(true);
      try {
        const rawOrders = await fetchOrders();
        if (!active) return;

        const courseIds = Array.from(new Set(rawOrders.flatMap((o) => o.items.map((i) => i.courseId))));
        const courseDtos = courseIds.length ? await fetchCoursesByIds(courseIds) : [];
        if (!active) return;
        const courseMap = new Map(courseDtos.map((dto) => [dto.id, mapCourseCompare(dto, language)]));

        const mapped: OrderView[] = rawOrders.map((order) => ({
          ...order,
          itemsView: order.items.map((item) => {
            const course = courseMap.get(item.courseId);
            return {
              id: item.id,
              title: item.courseTitle,
              instructor: course?.instructor ?? "Đang cập nhật",
              image: course?.image ?? "",
              price: item.unitPrice,
            };
          }),
          trackingSteps: buildTrackingSteps(order.status, order.createdAt),
        }));

        setOrders(mapped);
      } catch {
        if (!active) return;
        setOrders([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [isAuthenticated, language]);

  const handleTrack = () => {
    const q = searchInput.trim().toUpperCase();
    if (!q) return;
    const found = orders.find((o) => String(o.id).toUpperCase() === q || String(o.id).toUpperCase().includes(q));
    if (found) {
      setTrackedOrder(found);
      setNotFound(false);
    } else {
      setTrackedOrder(null);
      setNotFound(true);
    }
  };

  const handleDownloadInvoice = (order: OrderView) => {
    const content = `
HÓA ĐƠN ĐIỆN TỬ
=====================================
EduCourse - Học UX/UI Design Online
=====================================
Mã đơn hàng: ${order.id}
Ngày tạo: ${new Date(order.createdAt).toLocaleDateString("vi-VN")}
-------------------------------------
SẢN PHẨM:
${order.itemsView.map((item) => `  - ${item.title}\n    Giảng viên: ${item.instructor}\n    Giá: ${formatPrice(item.price)}`).join("\n")}
-------------------------------------
Tổng phụ: ${formatPrice(order.subtotal)}
Giảm giá: ${formatPrice(order.discountTotal)}
${order.couponCode ? `Mã giảm giá: ${order.couponCode}\n` : ""}TỔNG CỘNG: ${formatPrice(order.total)}
=====================================
Cảm ơn bạn đã tin tưởng EduCourse!
    `.trim();
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hoa-don-${order.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Hóa đơn đã được tải xuống!");
  };

  const OrderCard = ({ order }: { order: OrderView }) => {
    const sc = statusConfig[order.status] ?? { label: order.status, color: "bg-gray-100 text-gray-700" };
    const doneSteps = order.trackingSteps.filter((s) => s.done).length;
    const learnHref = order.items[0]?.courseSlug ? `/learn/${order.items[0].courseSlug}` : "/my-learning";
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
        <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="mb-1 flex items-center gap-3">
                <p className="font-mono font-bold text-gray-900">{order.id}</p>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${sc.color}`}>{sc.label}</span>
              </div>
              <p className="text-sm text-gray-500">Đặt ngày {new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
            </div>
            <button onClick={() => handleDownloadInvoice(order)} className="flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-1.5 text-sm text-blue-600 transition hover:bg-blue-50">
              <Download className="size-4" />Hóa đơn
            </button>
          </div>
        </div>

        <div className="p-5">
          <div className="mb-5">
            <p className="mb-4 text-sm font-semibold text-gray-700">Tiến trình đơn hàng</p>
            <div className="relative">
              <div className="absolute left-5 right-5 top-5 h-0.5 bg-gray-200">
                <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${((doneSteps - 1) / (order.trackingSteps.length - 1)) * 100}%` }} />
              </div>
              <div className="relative flex justify-between">
                {order.trackingSteps.map((step, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center">
                    <div className={`z-10 flex size-10 items-center justify-center rounded-full border-2 transition-all ${step.done ? "border-green-500 bg-green-500 text-white" : "border-gray-200 bg-white text-gray-300"}`}>
                      {step.done ? <CheckCircle className="size-5" /> : stepIcons[i] || <Clock className="size-4" />}
                    </div>
                    <p className={`mt-2 text-center text-xs ${step.done ? "font-medium text-green-700" : "text-gray-400"}`}>{step.label}</p>
                    {step.date && <p className="mt-0.5 text-xs text-gray-400">{step.date}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-4 space-y-3">
            {order.itemsView.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                {item.image ? <img src={item.image} alt={item.title} className="h-10 w-14 flex-shrink-0 rounded-lg object-cover" /> : <div className="h-10 w-14 flex-shrink-0 rounded-lg bg-gray-200" />}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.instructor}</p>
                </div>
                <p className="flex-shrink-0 text-sm font-semibold text-blue-600">{formatPrice(item.price)}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
            <div className="text-sm text-gray-500">
              <span>💳 {order.currency || "VND"}</span>
              {order.couponCode && order.discountTotal > 0 ? <span className="ml-2 text-green-600">Mã {order.couponCode}</span> : null}
            </div>
            <div className="text-right">
              {order.discountTotal > 0 ? <p className="text-xs text-gray-400 line-through">{formatPrice(order.subtotal)}</p> : null}
              <p className="text-xs text-gray-400">Tổng cộng</p>
              <p className="text-lg font-bold text-gray-900">{formatPrice(order.total)}</p>
            </div>
          </div>

          {order.status === "completed" && (
            <Link to={learnHref} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-sm font-medium text-white transition hover:bg-green-700">
              <BookOpen className="size-4" />Vào học ngay
            </Link>
          )}
        </div>
      </div>
    );
  };

  const userOrders = isAuthenticated && user ? orders : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 py-12 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-blue-200 transition hover:text-white">
            <ArrowLeft className="size-4" />Về trang chủ
          </Link>
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-white/20">
            <Package className="size-8" />
          </div>
          <h1 className="mb-2 text-3xl font-bold">Theo dõi đơn hàng</h1>
          <p className="mb-8 text-blue-100">Nhập mã đơn hàng để xem trạng thái chi tiết</p>

          <div className="mx-auto flex max-w-xl gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
              <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleTrack()} placeholder="Nhập mã đơn hàng (VD: 123)" className="w-full rounded-xl py-3.5 pl-12 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <button onClick={handleTrack} className="whitespace-nowrap rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">Tra cứu</button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {loading && <div className="py-8 text-center text-gray-500">Đang tải đơn hàng...</div>}

        {notFound && (
          <div className="mb-8 rounded-2xl border border-gray-200 bg-white py-12 text-center">
            <XCircle className="mx-auto mb-3 size-12 text-red-400" />
            <h3 className="mb-1 font-bold text-gray-900">Không tìm thấy đơn hàng</h3>
            <p className="text-sm text-gray-500">Kiểm tra lại mã đơn hàng hoặc liên hệ hỗ trợ: support@educourse.vn</p>
          </div>
        )}

        {trackedOrder && (
          <div className="mb-8">
            <h2 className="mb-4 font-bold text-gray-900">Kết quả tra cứu</h2>
            <OrderCard order={trackedOrder} />
          </div>
        )}

        {isAuthenticated && userOrders.length > 0 && (
          <div>
            <h2 className="mb-4 font-bold text-gray-900">Đơn hàng của tôi ({userOrders.length})</h2>
            <div className="space-y-5">
              {userOrders.map((order) => <OrderCard key={order.id} order={order} />)}
            </div>
          </div>
        )}

        {!isAuthenticated && !trackedOrder && !notFound && (
          <div className="rounded-2xl border border-gray-200 bg-white py-12 text-center">
            <Package className="mx-auto mb-3 size-12 text-gray-300" />
            <h3 className="mb-1 font-bold text-gray-900">Tra cứu đơn hàng</h3>
            <p className="mb-4 text-sm text-gray-500">Nhập mã đơn hàng ở trên, hoặc đăng nhập để xem tất cả đơn hàng</p>
            <Link to="/account?tab=orders" className="text-sm font-medium text-blue-600 hover:underline">Đăng nhập để xem đơn hàng →</Link>
          </div>
        )}

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
      </div>
    </div>
  );
}
