"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchCoursesByIds, fetchOrders, formatPrice, mapCourseCompare, type OrderDto } from "@/services/api";
import { toast } from "@/lib/notify";
import type { OrderView } from "@/components/order-tracking/OrderTrackingCard";

function buildTrackingSteps(status: string, createdAt: string) {
  return [
    { label: "Đặt hàng", done: true, date: new Date(createdAt).toLocaleDateString("vi-VN") },
    { label: "Xác nhận", done: status !== "pending", date: "" },
    { label: "Xử lý", done: status === "processing" || status === "completed", date: "" },
    { label: "Hoàn thành", done: status === "completed", date: "" },
  ];
}

export function useOrderTrackingPage() {
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

        const mapped: OrderView[] = rawOrders.map((order: OrderDto) => ({
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

    void load();
    return () => {
      active = false;
    };
  }, [isAuthenticated, language]);

  const handleTrack = () => {
    const q = searchInput.trim().toUpperCase();
    if (!q) return;
    const found = orders.find((order) => String(order.id).toUpperCase() === q || String(order.id).toUpperCase().includes(q));
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
${order.itemsView
  .map((item) => `  - ${item.title}\n    Giảng viên: ${item.instructor}\n    Giá: ${formatPrice(item.price)}`)
  .join("\n")}
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

  const userOrders = isAuthenticated && user ? orders : [];

  return {
    isAuthenticated,
    user,
    searchInput,
    setSearchInput,
    trackedOrder,
    notFound,
    orders,
    loading,
    userOrders,
    handleTrack,
    handleDownloadInvoice,
  } as const;
}
